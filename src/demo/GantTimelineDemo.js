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
          end: '12-31-2018'
        }
      ],
      scale: 'day',
      range: 30
    });
    libInstance.draw()
  }
}

export default GantTimelineDemo;
