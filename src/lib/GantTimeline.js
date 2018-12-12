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
		iteratee : ({ [iteratee]: prop }) => prop
  
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
		this.lowerCellWidth = this.options.lowerCellWidth || defaultCellwidth[this.scale]
		this.data = this.options.data || []
		this.globalStart = moment(this.defaultDay).subtract(this.range, this.scale).startOf(this.scale)
		this.globalEnd = moment(this.defaultDay).add(this.range, this.scale).endOf(this.scale)
		this.dayFormat = options.dayFormat || 'DD'
		this.monthFormat = options.monthFormat || 'MMM'
		this.yearFormat = options.yearFormat || 'YYYY'
		this.defaultData = this._getDefaultData()
	}

	// _getHeaderBy(type, format) {
	// 	let start = this.globalStart
	// 	, end = this.globalEnd
	// 	, elements = ''
	// 	, width
	// 	, totalWidth = 0

	// 	while (start.diff(end) <= 0) {
	// 		let nextStart = start.clone().add(1, type).startOf(type)
	// 		if ('day' === type) {
	// 			width = this.lowerCellWidth
	// 		} else {
	// 			width = nextStart.diff(end) <= 0 ? nextStart.diff(start, 'days') * this.lowerCellWidth : (end.diff(start, 'days') + 1) * this.lowerCellWidth
	// 		}
	// 		totalWidth += width
	// 		elements += '<div class="gt-header-cell" style="width: ' + (width - 2) + 'px">' + start.clone().format(format) + '</div>'
	// 		start = nextStart
	// 	}
		
	// 	return '<div class="gt-header" style="width: ' + totalWidth + 'px">' + elements + '</div>'
	// }

	_getHeaderGrid(type) {
		let elements = ''
		, groupedByYear = groupBy(this.defaultData, 'year')

		for (let year in groupedByYear) {
			if (type !== 'year') {
				let groupedByMonth = groupBy(groupedByYear[year], 'month')
				for (let month in groupedByMonth) {
					if (type !== 'month') {
						for (let day of groupedByMonth[month]) {
							elements += '<div class="gt-header-cell" style="width: ' + (this.lowerCellWidth - 2) + 'px">' + day['day'] + '</div>'
						}
					} else {
						elements += '<div class="gt-header-cell" style="width: ' + ((this.lowerCellWidth * groupedByMonth[month].length) - 2) + 'px">' + month + '</div>'
					}
				}
			} else {
				elements += '<div class="gt-header-cell" style="width: ' + ((this.lowerCellWidth * groupedByYear[year].length) - 2) + 'px">' + year + '</div>'
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

	_getBodyGrid(data, width) {
		let yearElements = ''
		, groupedByYear = groupBy(data, 'year')
		for (let year in groupedByYear) {
			let monthElements = ''
			, groupedByMonth = groupBy(groupedByYear[year], 'month')
			for (let month in groupedByMonth) {
				let dayElements = ''
				for (let day of groupedByMonth[month]) {
					if (day.isStart) {
						dayElements += '<div class="gt-body-cell-day start" style="width: ' + (this.lowerCellWidth - 2) + 'px">'
						+ '<div class="gt-timeline" style="background-color: blue; width: ' + width + 'px"></div>'
						+ '</div>'
					} else if (day.isEnd) {
						dayElements += '<div class="gt-body-cell-day end" style="width: ' + (this.lowerCellWidth - 2) + 'px"></div>'
					} else {
						dayElements += '<div class="gt-body-cell-day" style="width: ' + (this.lowerCellWidth - 2) + 'px"></div>'
					}
				}
				monthElements += '<div class="gt-body-cell-month">' + dayElements + '</div>'
			}
			yearElements += '<div class="gt-body-cell-year">' + monthElements + '</div>'
		}
		
		return '<div class="gt-body-line" style="width: ' + (data.length * this.lowerCellWidth) + 'px">' + yearElements + '</div>'
	}

	_getTimeline(line) {
		if (!line.start || !line.end) return ''
		let data = JSON.parse(JSON.stringify(this.defaultData))
		, start = moment(line.start)
		, end = moment(line.end)
		, width = 0

		if (start.diff(this.globalEnd, 'days') < 0 && this.globalStart.diff(end, 'days') < 0) {
			let idStart
			, idEnd

			if (start.diff(this.globalStart, 'days') > 0) {
				idStart = start.format('X')
			} else {
				idStart = this.globalStart.format('X')
			}

			if (this.globalEnd.diff(end, 'days') > 0) {
				idEnd = end.format('X')
			} else {
				idEnd = this.globalEnd.format('X')
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

			width = (idEnd - idStart) / 86400 * this.lowerCellWidth
		}

		return this._getBodyGrid(data, width)

		// let start = moment(line.start)
		// , end = moment(line.end)
		// , element = ''
		// , color = line.color || 'blue'
		// if (start.diff(this.globalEnd, 'days') < 0 && this.globalStart.diff(end, 'days') < 0) {
		// 	let margin
		// 	, width
			
		// 	if (start.diff(this.globalStart, 'days') > 0) {
		// 		margin = moment(line.start).diff(this.globalStart, 'days') * this.lowerCellWidth
		// 	} else {
		// 		start = this.globalStart
		// 		margin = 0
		// 	}
			
		// 	if (this.globalEnd.diff(end, 'days') > 0) {
		// 		width = (end.diff(start, 'days') + 1) * this.lowerCellWidth
		// 	} else {
		// 		width = (this.globalEnd.diff(start, 'days') + 1) * this.lowerCellWidth
		// 	}
			
		// 	element = '<div class="gt-timeline" style="margin-left: ' + margin + 'px; width: ' + width + 'px; background-color: ' + color + '"></div>'
		// }

		// return '<div class="gt-body-cell gt-right-cell"></div>'
	}

	_getGroupTimeline(name, group) {
		let elements = ''
		, groupTimeline = {
			name: name,
			start: null,
			end: null,
			color: 'red'
		}

		for (let line of group) {
			if (!groupTimeline.start || moment(line.start).diff(group.start, 'day') < 0) {
				groupTimeline.start = moment(line.start)
			}
			if (!groupTimeline.end || groupTimeline.end.diff(moment(line.end), 'day') < 0) {
				groupTimeline.end = moment(line.end)
			}
			elements += this._getTimeline(line)
		}

		return this._getTimeline(groupTimeline) + elements
	}

	_getRightBody() {
		let elements = ''
		, dataByGroup = groupBy(this.data, 'groupName')
		for (let groupName in dataByGroup) {
			if (groupName !== 'other') {
				elements += this._getGroupTimeline(groupName, dataByGroup[groupName])
			} else {
				for (let line of dataByGroup[groupName]) {
					elements += this._getTimeline(line)
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
	}
}

export default GantTimeline