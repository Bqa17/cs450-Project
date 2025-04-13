import React, { Component } from 'react';
import * as d3 from 'd3';

class PostseasonHeatmap extends Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
    this.state = {
      selectedYear: 2019, // Default year
      yearRange: null,
      processedData: null
    };
  }

  componentDidMount() {
    this.initializeYearRange();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.data !== this.props.data) {
      this.initializeYearRange();
    } else if (prevState.selectedYear !== this.state.selectedYear) {
      this.processData();
    }
  }

  initializeYearRange() {
    const { data } = this.props;
    
    if (!data || data.length === 0) return;

    // Get min and max years from data
    const years = data.map(d => d.season).filter(year => year);
    const minYear = d3.min(years);
    const maxYear = d3.max(years);
    
    // Set default year to the latest available if possible
    const defaultYear = maxYear || 2019;
    
    this.setState({
      yearRange: [minYear, maxYear],
      selectedYear: defaultYear
    }, this.processData);
  }

  processData() {
    const { data } = this.props;
    const { selectedYear } = this.state;
    
    if (!data || data.length === 0) return;

    // Filter data for the selected year
    const yearData = data.filter(d => d.season === selectedYear);
    
    // Define the postseason rounds and their order
    const rounds = ['R64', 'R32', 'S16', 'E8', 'F4', '2ND', 'Champions'];
    const seeds = Array.from({length: 16}, (_, i) => i + 1);
    
    // Initialize the matrix with zeros
    const matrix = seeds.map(() => Array(rounds.length).fill(0));
    
    // Count teams in each seed/round combination
    yearData.forEach(team => {
      if (team.marchMadnessSeed && team.roundEliminated) {
        const seedIdx = team.marchMadnessSeed - 1;
        const roundIdx = rounds.indexOf(team.roundEliminated);
        
        if (seedIdx >= 0 && seedIdx < 16 && roundIdx >= 0) {
          // Mark all previous rounds as well (if a team reached E8, they also reached R64, R32, S16)
          for (let i = 0; i <= roundIdx; i++) {
            matrix[seedIdx][i]++;
          }
        }
      }
    });
    
    // Calculate percentages based on total teams for each seed
    const seedCounts = seeds.map((_, i) => yearData.filter(d => d.marchMadnessSeed === i + 1).length);
    
    const percentageMatrix = matrix.map((row, seedIdx) => {
      const totalTeams = seedCounts[seedIdx] || 1; // Avoid division by zero
      return row.map(count => count / totalTeams);
    });
    
    this.setState({ processedData: percentageMatrix }, this.renderChart);
  }

  handleYearChange = (event) => {
    this.setState({ selectedYear: parseInt(event.target.value) });
  }

  renderChart() {
    const { processedData } = this.state;
    if (!processedData) return;

    // Clear previous chart
    d3.select(this.chartRef.current).selectAll("svg").remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 50 };
    const width = this.chartRef.current.clientWidth;
    const height = this.chartRef.current.clientHeight - 50; // Adjust for slider
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(this.chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the rounds and seeds
    const rounds = ['R64', 'R32', 'S16', 'E8', 'F4', '2ND', 'Champions'];
    const seeds = Array.from({length: 16}, (_, i) => i + 1);

    // Scales
    const xScale = d3.scaleBand()
      .domain(rounds)
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(seeds)
      .range([0, innerHeight])
      .padding(0.1);

    const colorScale = d3.scaleSequential()
      .domain([0, 1]) // Percentage from 0 to 1
      .interpolator(d3.interpolateViridis);

    // Create the heatmap cells
    g.selectAll(".heatmap-cell")
      .data(processedData.flatMap((row, seedIdx) => 
        row.map((value, roundIdx) => ({
          seed: seeds[seedIdx],
          round: rounds[roundIdx],
          value: value
        }))
      ))
      .enter()
      .append("rect")
      .attr("class", "heatmap-cell")
      .attr("x", d => xScale(d.round))
      .attr("y", d => yScale(d.seed))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.value))
      .append("title")
      .text(d => `Seed: ${d.seed}, Round: ${d.round}\nPercentage: ${(d.value * 100).toFixed(1)}%`);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em");

    g.append("g")
      .call(d3.axisLeft(yScale));

    // Labels
    svg.append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .text(`NCAA Tournament Advancement by Seed (${this.state.selectedYear})`);

    svg.append("text")
      .attr("transform", `translate(${width/2}, ${height - 10})`)
      .style("text-anchor", "middle")
      .text("Tournament Round");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 3)
      .attr("x", -(height / 2))
      .attr("text-anchor", "middle")
      .text("Seed");

    // Add color legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - margin.right - legendWidth;
    const legendY = margin.top / 2;

    const legendScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, legendWidth]);

    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");

    linearGradient.selectAll("stop")
      .data([
        {offset: "0%", color: colorScale(0)},
        {offset: "25%", color: colorScale(0.25)},
        {offset: "50%", color: colorScale(0.5)},
        {offset: "75%", color: colorScale(0.75)},
        {offset: "100%", color: colorScale(1)}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    svg.append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#linear-gradient)");

    const legendAxis = d3.axisBottom(legendScale)
      .tickFormat(d => `${(d * 100).toFixed(0)}%`)
      .ticks(5);

    svg.append("g")
      .attr("transform", `translate(${legendX},${legendY + legendHeight})`)
      .call(legendAxis);

    svg.append("text")
      .attr("x", legendX + legendWidth / 2)
      .attr("y", legendY - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Percentage of Teams");
  }

  render() {
    const { selectedYear, yearRange } = this.state;

    if (!yearRange) {
      return <div>Loading year data...</div>;
    }

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="chart-title">NCAA Tournament Advancement by Seed</div>
        <div className="year-slider" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px' }}>Season: {selectedYear}</span>
          <input 
            type="range" 
            min={yearRange[0]} 
            max={yearRange[1]} 
            value={selectedYear} 
            onChange={this.handleYearChange} 
            style={{ flex: 1 }}
          />
        </div>
        <div ref={this.chartRef} style={{ flex: 1 }}></div>
      </div>
    );
  }
}

export default PostseasonHeatmap;