import './css/GantTimelineDemo.css';
import Lib from '../lib';

class GantTimelineDemo {
  constructor(){
    let libInstance = new Lib('ganttimeline', {
      data: [
        {
          name: 'Phase1',
          groupName: 'TimelimeLibCreation',
          start: '12-01-2018',
          end: '12-06-2018'
        },
        {
          name: 'Phase2',
          groupName: 'TimelimeLibCreation',
          start: '12-10-2018',
          end: '12-30-2018'
        },
        {
          name: 'Phase3',
          groupName: 'TimelimeLibCreation',
          start: '11-20-2018',
          end: '01-12-2019'
        },
        {
          name: 'Phase3',
          groupName: 'TimelimeLibCreation',
          start: '11-15-2018',
          end: '01-13-2019'
        }
      ],
      scale: 'day',
      range: 30
    });
    libInstance.draw()
    libInstance.on('onDayClick', function(data, date) {
      alert(data.name + ': ' + date)
    })
  }
}

export default GantTimelineDemo;
