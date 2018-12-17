import './css/GantTimeline.css'

const moment = require('moment')
require('moment/locale/fr')

const defaultCellwidth = {
    day: 25,
    month: 15,
    year: 1
}

const groupBy = (collection, iteratee = (x) => x) => {
    const it = typeof iteratee === 'function' ?
        iteratee : ({[iteratee]: prop}) => prop

    const array = Array.isArray(collection) ? collection : Object.values(collection)

    return array.reduce((r, e) => {
        const k = it(e) || 'other'

        r[k] = r[k] || []

        r[k].push(e)

        return r
    }, {})
}

class GantTimeline {
    constructor(id, options) {
        this.id = id
        this.options = options || {}
        this.defaultDay = this.options.defaultDay ? moment(this.options.defaultDay).startOf('day') : moment().startOf('day')
        this.range = typeof this.options.range === 'undefined' ? 3 : this.options.range
        this.scale = this.options.scale || 'day'
        this.lowerCellWidth = this.options.lowerCellWidth || getComputedStyle(document.body).getPropertyValue('--cell-width')
        this.lowerCellBorderWidth = this.options.lowerCellBorderWidth || getComputedStyle(document.body).getPropertyValue('--border-width')
        this.data = this.options.data || []
        this.globalStart = moment(this.defaultDay).subtract(this.range, this.scale).startOf(this.scale)
        this.globalEnd = moment(this.defaultDay).add(this.range, this.scale).endOf(this.scale)
        this.dayFormat = options.dayFormat || 'DD'
        this.monthFormat = options.monthFormat || 'MMM'
        this.yearFormat = options.yearFormat || 'YYYY'
        this.defaultData = this._getDefaultData()
        this.triggers = {}
    }

    on(event, callback) {
        this.triggers[event] = callback
    }

    _trigger(event, params) {
        if (this.triggers[event]) {
            this.triggers[event].apply(null, params);
        }
    }

    _getHeaderGrid(type) {
        let elements = ''
            , groupedByYear = groupBy(this.defaultData, 'year')

        this.lowerCellBorderWidth = parseInt(this.lowerCellBorderWidth);
        for (let year in groupedByYear) {
            if (type !== 'year') {
                let groupedByMonth = groupBy(groupedByYear[year], 'month')
                for (let month in groupedByMonth) {
                    if (type !== 'month') {
                        for (let day of groupedByMonth[month]) {
                            elements += '<div class="gt-header-cell" style="width: ' + (this.lowerCellWidth) + 'px">' + day['day'] + '</div>'
                        }
                    } else {
                        elements += '<div class="gt-header-cell"  style="width: ' + (((this.lowerCellWidth + this.lowerCellBorderWidth) * groupedByMonth[month].length - this.lowerCellBorderWidth)) + 'px">' + month + '</div>'
                    }
                }
            } else {
                elements += '<div class="gt-header-cell" style="width: ' + (((this.lowerCellWidth + this.lowerCellBorderWidth) * groupedByYear[year].length - this.lowerCellBorderWidth)) + 'px">' + year + '</div>'
            }
        }

        return '<div class="gt-header" style="width: ' + (this.defaultData.length * this.lowerCellWidth) + 'px">' + elements + '</div>'
    }

    _getDefaultData() {
        let start = this.globalStart
            , end = this.globalEnd
            , defaultData = []

        while (start.diff(end) <= 0) {
            let nextStart = start.clone().add(1, 'day').startOf('day')
            defaultData.push({
                id: start.format('X'),
                date: start.format('MM-DD-YYYY'),
                year: start.format(this.yearFormat),
                month: start.format(this.monthFormat),
                day: start.format(this.dayFormat)
            })
            start = nextStart
        }

        return defaultData
    }

    _getRightHeader() {
        switch (this.scale) {
            case 'year':
                return this._getHeaderGrid('year')
            case 'month':
                return this._getHeaderGrid('year') + this._getHeaderGrid('month')
            case 'day':
                return this._getHeaderGrid('year') + this._getHeaderGrid('month') + this._getHeaderGrid('day')
            default:
                return ''
        }
    }

    _getLeftHeader() {
        let height

        switch (this.scale) {
            case 'year':
                height = 20
                break
            case 'month':
                height = 40
                break
            case 'day':
                height = 60
                break
            default:
                return ''
        }

        return '<div class="gt-header" style="height: ' + height + 'px"></div>'
    }

    _getLeftBody() {
        let elements = ''
            , dataByGroup = groupBy(this.data, 'groupName')

        for (let groupName in dataByGroup) {
            if (groupName !== 'other') {
                elements += '<div class="gt-body-cell gt-body-cell gt-left-group-cell">' + groupName + '</div>'
                for (let line of dataByGroup[groupName]) {
                    elements += '<div class="gt-body-cell gt-left-cell gt-left-sub-cell">' + line.name + '</div>'
                }
            } else {
                for (let line of dataByGroup[groupName]) {
                    elements += '<div class="gt-body-cell gt-left-cell">' + line.name + '</div>'
                }
            }
        }

        return '<div class="gt-body">' + elements + '</div>'
    }

    _getBodyGrid(line, data, width, extendable) {
        let yearElements = ''
            , groupedByYear = groupBy(data, 'year')

        for (let year in groupedByYear) {
            let monthElements = ''
                , groupedByMonth = groupBy(groupedByYear[year], 'month')

            for (let month in groupedByMonth) {
                let dayElements = ''

                for (let day of groupedByMonth[month]) {
                    if (day.isStart) {
                        dayElements += '<div class="gt-body-cell-day start" data-line="' + line._id + '" data-value="' + day['date'] + '" style="width: ' + (this.lowerCellWidth) + 'px">'
                            + (extendable.start ? '<div class="gt-extendable-start" draggable="true" style="background-color: red; width: 10px"></div>' : '')
                            + '<div class="gt-timeline" style="background-color: blue; width: ' + width + 'px"></div>'
                            + '</div>'
                    } else if (day.isEnd) {
                        dayElements += '<div class="gt-body-cell-day end" data-line="' + line._id + '" data-value="' + day['date'] + '" style="width: ' + (this.lowerCellWidth) + 'px">'
                            + (extendable.end ? '<div class="gt-extendable-end" draggable="true" style="background-color: red; width: 10px"></div>' : '')
                            + '</div>'
                    } else {
                        dayElements += '<div class="gt-body-cell-day" data-line="' + line._id + '" data-value="' + day['date'] + '" style="width: ' + (this.lowerCellWidth) + 'px"></div>'
                    }
                }
                monthElements += '<div class="gt-body-cell-month">' + dayElements + '</div>'
            }
            yearElements += '<div class="gt-body-cell-year">' + monthElements + '</div>'
        }

        return '<div class="gt-body-line" style="width: ' + (data.length * this.lowerCellWidth) + 'px">' + yearElements + '</div>'
    }

    _getTimeline(line, isExtendable) {
        if (!line.start || !line.end) return ''
        let data = JSON.parse(JSON.stringify(this.defaultData))
            , start = moment(line.start)
            , end = moment(line.end)
            , width = 0
            , extendable = {start: isExtendable, end: isExtendable}

        if (start.diff(this.globalEnd, 'days') < 0 && this.globalStart.diff(end, 'days') < 0) {
            let idStart
                , idEnd

            if (start.diff(this.globalStart, 'seconds') >= 0) {
                idStart = start.format('X')
            } else {
                idStart = this.globalStart.format('X')
                extendable.start = false
            }

            if (this.globalEnd.diff(end, 'seconds') > 0) {
                idEnd = end.format('X')
                width = ((idEnd - idStart) / 86400 + 1) * this.lowerCellWidth
            } else {
                idEnd = parseInt(this.globalEnd.format('X')) + 1
                width = (idEnd - idStart) / 86400 * this.lowerCellWidth
                extendable.end = false
            }

            data.map((e) => {
                if (e.id === idStart) {
                    e.isStart = true
                }

                return e
            })

            data.map((e) => {
                if (e.id === idEnd) {
                    e.isEnd = true
                }

                return e
            })

        }

        return this._getBodyGrid(line, data, width, extendable)
    }

    _getGroupTimeline(name, group) {
        let elements = ''
            , i = 1
            , groupTimeline = {
            name: name,
            start: null,
            end: null,
            color: 'red'
        }

        for (let line of group) {
            line._id = line.groupName + i
            if (!groupTimeline.start || moment(line.start).diff(group.start, 'day') < 0) {
                groupTimeline.start = moment(line.start)
            }
            if (!groupTimeline.end || groupTimeline.end.diff(moment(line.end), 'day') < 0) {
                groupTimeline.end = moment(line.end)
            }
            elements += this._getTimeline(line, true)
            i++
        }

        return this._getTimeline(groupTimeline, false) + elements
    }

    _getRightBody() {
        let elements = ''
            , dataByGroup = groupBy(this.data, 'groupName')

        for (let groupName in dataByGroup) {
            if (groupName !== 'other') {
                elements += this._getGroupTimeline(groupName, dataByGroup[groupName])
            } else {
                let i = 1
                for (let line of dataByGroup[groupName]) {
                    line._id = groupName + i
                    elements += this._getTimeline(line, true)
                    i++
                }
            }
        }

        return '<div class="gt-body">' + elements + '</div>'
    }

    _getLeftContent() {
        return this._getLeftHeader() + this._getLeftBody()
    }

    _getRightContent() {
        return this._getRightHeader() + this._getRightBody()
    }

    _createEvents() {
        const self = this
            , cells = document.getElementsByClassName("gt-body-cell-day")
        for (let cell of cells) {
            cell.onclick = function (e) {
                e.preventDefault()
                let data = self.data.find((e) => {
                    return e._id === cell.getAttribute('data-line')
                })
                self._trigger('onDayClick', [data, cell.getAttribute('data-value')])
            }
        }
    }

    draw() {
        let container = document.getElementById(this.id)
        if (!container) {
            return
        }
        container.innerHTML = ''
        container.classList.add('gt-container')

        let leftContent = document.createElement('div')
            , rightContent = document.createElement('div')
        leftContent.innerHTML = '<div class="gt-content gt-left-content">' + this._getLeftContent() + '</div>'
        rightContent.innerHTML = '<div class="gt-content gt-right-content">' + this._getRightContent() + '</div>'
        container.appendChild(leftContent.firstChild)
        container.appendChild(rightContent.firstChild)

        this._createEvents()
    }
}

export default GantTimeline
