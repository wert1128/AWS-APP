import React from 'react';
import * as AWS from 'aws-sdk';
class Ping extends React.Component {

    docClient: AWS.DynamoDB.DocumentClient;
    counter = 0;
    // I would not declare the sum in the class, but a local variable in the function cannot be accessed in lambda,
    // I am aware that this is not the best practice
    sum = 0;
    // at the beginning of the process, the database will not have all three most recent pings,
    // so the pings returned will either be null or be inaccurate.
    numPingGreaterThan3 = false;

    state = {
        average_ping: 0
    };

    counterIncrease() {
        if (this.counter >= 2) {
            this.counter = 0;
            this.numPingGreaterThan3 = true;
        } else {
            this.counter += 1;
        }
    }
    /* 
     * detectPing()
     * Record the current time before fetching from amazon and the current time after fetching.
     * Calculate the difference in ms and push it to the end of pings array.
     */
    async detectPing() {
        const begin_time = new Date().getTime();
        const url = 'amazon.com';
        await fetch(url);
        const end_time = new Date().getTime();
        return end_time-begin_time;
    }

    /* 
     * sendPing()
     * Calls detectPing to acquire the current ping, then send the most recent ping to the database
     * The database keeps track of the most recent three pings
     */
    async sendPing() {
        const ping = await this.detectPing();

        const params = {
            TableName: "PINGS",
            Item: {
                'Order': this.counter,
                'Ping': ping
            }
        };
        this.docClient.put(params, (err, data) => {
            if (err) {
                console.log(err);
            }
        });

        this.counterIncrease();
    }

    /* 
     * getAveragePing()
     * retrieve the three most recent pings from the database
     * calculate the average of the three and set the average as state to display
     */
    async getAveragePing() {
        if (!this.numPingGreaterThan3) {
            return false;
        }

        for (var i = 0; i < 3; i++) {
            const params = {
                TableName: "PINGS",
                Key: {
                    'Order': i
                }
            };
            this.docClient.get(params, (err, data) => {
                if (err) {
                    console.log(err);
                }else {
                    //console.log(data);
                    try{
                        this.sum += data.Item!.Ping;
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
        }
        this.setState({average_ping: this.sum/3});
        // zero out the sum, this is just a temporary fix
        this.sum = 0;
    }
    
    constructor(props: {}) {
        super(props);
        // provide the config file the credentials
        AWS.config.update({
            accessKeyId: process.env.REACT_APP_ACCESS_ID,
            secretAccessKey: process.env.REACT_APP_ACCESS_KEY,
            region: process.env.REACT_APP_REGION
          });
        // get and send ping every 0.5 second
        setInterval(() => this.sendPing(), 500);
        setInterval(() => this.getAveragePing(), 500);
        this.docClient = new AWS.DynamoDB.DocumentClient();
    }


    render() {
        return (
            <div className='ping_board'>
                平均延迟：{Math.round(this.state.average_ping * 100) / 100} ms
            </div>
        );
    }
}

export default Ping;