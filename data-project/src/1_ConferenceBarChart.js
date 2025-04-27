import React, { Component } from 'react';
import * as d3 from 'd3';

class ConferenceBarChart extends Component {
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
    const formattedData = parsedCsv.map((row) => {
      return {
        team: row.TEAM,
        conference: row.CONF,
      };
    });

    this.setState({ data: formattedData }, () => {
      this.prepareChartData();
    });
  };

  prepareChartData() {
    const { data } = this.state;

    // Group data by conference
    const groupedData = data.reduce((acc, row) => {
      const conference = row.conference;
      if (!acc[conference]) {
        acc[conference] = 0;
      }
      acc[conference] += 1;
      return acc;
    }, {});

    const chartData = Object.entries(groupedData).map(([conference, count]) => ({
      conference,
      count,
    }));

    this.renderChart(chartData);
  }

  renderChart(chartData) {
    const width = 515;
    const height = 300;
    const margin = { top: 10, right: 20, bottom: 60, left: 45 };

    const svg = d3.select(this.chartRef.current)
      .attr('width', width)
      .attr('height', height);

    // Clear previous chart
    svg.selectAll('*').remove();

    const xScale = d3.scaleBand()
      .domain(chartData.map(d => d.conference))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.count)]).nice()
      .range([height - margin.bottom, margin.top]);

    // Bars
    svg.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.conference))
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - margin.bottom - yScale(d.count))
      .attr('fill', '#095096');

    // X Axis
      svg.selectAll('.x-axis-label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'x-axis-label')
      .attr('x', d => xScale(d.conference) + xScale.bandwidth() / 2)
      .attr('y', height - margin.bottom + 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '9px')
      .attr('transform', (d) => `rotate(-90, ${xScale(d.conference) + xScale.bandwidth() / 2}, ${height - margin.bottom + 20})`)
      .text(d => d.conference);


    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));

    // Y Axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', margin.left - 30)
      .attr('x', -(height / 2))
      .attr('text-anchor', 'middle')
      .text('Number of Teams');
  }

  render() {
    const styles = {
      container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e8f4f8',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '8px',
        color: '#333',
        fontWeight: 'bold',
        border: '2px dashed #86c5da',
      },
      title: {
        marginBottom: '10px',
        fontSize: '1.2rem',
      },
      subtitle: {
        fontSize: '0.9rem',
        color: '#666',
      },
      chartContainer: {
        width: '90%',
        height: 400,
      },
    };

    return (
      <div style={styles.container}>
        <div style={styles.title}>Conference Bar Chart</div>
        <div style={styles.subtitle}>Teams per Conference</div>
        <div style={styles.chartContainer}>
          <svg ref={this.chartRef}></svg>
        </div>
      </div>
    );
  }
}

export default ConferenceBarChart;
