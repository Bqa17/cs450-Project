import './App.css';
import React, { Component } from 'react';
import * as d3 from 'd3';
import ConferenceBarChart from './1_ConferenceBarChart';
import WinsLineGraph from './2_WinsLineGraph';
import TurnoverScatterplot from './3_TurnoverScatterplot';
import SeedScatterplot from './4_SeedScatterplot';
import PostseasonHeatmap from './5_PostseasonHeatmap';
import ShootingStackedBar from './6_ShootingStackedBar';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true
    };
  }

  componentDidMount() {
    d3.csv(process.env.PUBLIC_URL + "/basketball.csv").then((data) => {
      // Parse numeric values from the CSV
      const parsed = data.map((d) => ({
        team: d["TEAM"],
        conference: d["CONF"],
        games: +d["G"],
        wins: +d["W"],
        powerRating: +d["BARTHAG"],
        turnoverRate: +d["TOR"],
        twoPtPct: +d["2P_O"],
        threePtPct: +d["3P_O"],
        winsAboveBubble: +d["WAB"],
        roundEliminated: d["POSTSEASON"],
        marchMadnessSeed: +d["SEED"],
        season: +d["YEAR"],
      }));
      
      this.setState({ 
        data: parsed,
        loading: false
      });
    });
  }

  render() {
    const { data, loading } = this.state;

    if (loading) {
      return <div className="loading">Loading basketball data...</div>;
    }

    return (
      <div className="dashboard">
        <h1>College Basketball Data Dashboard</h1>
        <div className="dashboard-grid">
        <div className="dashboard-item">
            <PostseasonHeatmap data={data} />
          </div>
          <div className="dashboard-item">
            <WinsLineGraph data={data} />
          </div>
          <div className="dashboard-item">
            <ConferenceBarChart data={data} />
          </div>
          <div className="dashboard-item">
            <TurnoverScatterplot data={data} />
          </div>
          <div className="dashboard-item">
            <SeedScatterplot data={data} />
          </div>
          <div className="dashboard-item">
            <ShootingStackedBar data={data} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;