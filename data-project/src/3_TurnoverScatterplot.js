import React, { Component } from 'react';
import * as d3 from 'd3';

class TurnoverScatterplot extends Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    d3.csv('/basketball.csv').then(this.set_data);
  }

  set_data = (parsedCsv) => {
    const formattedData = parsedCsv.map((row) => ({
      team: row.TEAM,
      conference: row.CONF,
      W: parseFloat(row.W),
      TOR: parseFloat(row.TOR),
    }));

    this.setState({ data: formattedData }, () => {
      this.prepareChartData();
    });
  };

  computeRegressionLine = (data) => {
    const n = data.length;
    const sumX = d3.sum(data, (d) => d.TOR);
    const sumY = d3.sum(data, (d) => d.W);
    const sumXY = d3.sum(data, (d) => d.TOR * d.W);
    const sumX2 = d3.sum(data, (d) => d.TOR * d.TOR);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  prepareChartData = () => {
    const { data } = this.state;
    d3.select(this.chartRef.current).selectAll('*').remove();
  
    const margin = { top: 10, right: 30, bottom: 130, left: 70 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select(this.chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    const xExtent = d3.extent(data, d => d.TOR);
    const yExtent = d3.extent(data, d => d.W);
  
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - 1, xExtent[1] + 1])
      .range([0, width]);
  
    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - 2, yExtent[1] + 2])
      .range([height, 0]);
  
    // X-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
  
    // X-axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Turnover Rate (%)');
  
    // Y-axis
    svg.append('g')
      .call(d3.axisLeft(yScale));
  
    // Y-axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -50)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Wins');
  
    // Points
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.TOR))
      .attr('cy', d => yScale(d.W))
      .attr('r', 5)
      .style('fill', 'steelblue')
      .style('opacity', 0.7);
  
    // Regression line
    const { slope, intercept } = this.computeRegressionLine(data);
    const xMin = xExtent[0] - 1;
    const xMax = xExtent[1] + 1;
    const yMin = slope * xMin + intercept;
    const yMax = slope * xMax + intercept;
  
    svg.append('line')
      .attr('x1', xScale(xMin))
      .attr('y1', yScale(yMin))
      .attr('x2', xScale(xMax))
      .attr('y2', yScale(yMax))
      .attr('stroke', 'red')
      .attr('stroke-width', 2);
  };
  
  

  render() {
    const styles = {
      container: {
        width: '94%',
        height: '90%',
        backgroundColor: '#f8e8e8',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '8px',
        color: '#333',
        fontWeight: 'bold',
        border: '2px dashed #da8686',
        padding: '1rem',
      },
      title: {
        marginTop: '100px',
        fontSize: '1rem',
        textAlign: 'center',
      },
      subtitle: {
        fontSize: '0.95rem',
        color: '#444',
        textAlign: 'center',
      },
      chartContainer: {
        width: '90%',
        height: 600,
      },
    };

    return (
      <div style={styles.container}>
        <div style={styles.title}>College Basketball: Turnover Rate vs. Wins</div>
        <div style={styles.subtitle}>Correlation: r = -0.34</div>
        <div style={styles.chartContainer} ref={this.chartRef}></div>
      </div>
    );
  }
}

export default TurnoverScatterplot;
