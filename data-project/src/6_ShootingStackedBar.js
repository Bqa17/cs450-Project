import React, { Component } from 'react';
import * as d3 from 'd3'

class ShootingStackedBar extends Component {
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
      const formattedData = parsedCsv
      .filter(row => {
        const val = row.SEED.trim()
        return val <= 1
      })
      .map((row) => ({
        team: row.TEAM,
        twopoint: parseFloat(row["2P_D"]),
        threepoint: parseFloat(row["3P_D"]),
        overall: parseFloat(row.EFG_D),
        overallSHOT: parseFloat(row.EFG_O)
      }));

      this.setState({ data: formattedData }, () => {
        this.prepareChartData();
      });
    };

    prepareChartData = () => {
      const { data } = this.state;
      d3.select(this.chartRef.current).selectAll('*').remove();
              
      const margin = { top: 10, right: 30, bottom: 40, left: 40 };
      const width = 515 - margin.left - margin.right;
          const height = 300 - margin.top - margin.bottom;

      const svg = d3.select(this.chartRef.current)
                  .attr('width', width + margin.left + margin.right)
                  .attr('height', height + margin.top + margin.bottom)
                  .append('g')
                  .attr('transform', `translate(${margin.left},${margin.top})`);

      const xScale = d3.scaleBand()
      .domain(data.map(d => d.team))
      .range([0,width])
      .padding(.2)

      const barScale = d3.scaleBand()
      .domain(['twoPoint', 'threePoint', 'effectiveFG'])
      .range([0, xScale.bandwidth()])
      .padding(.2)

      const yScale = d3.scaleLinear()
      .domain([0,70])
      .range([height, 0]);

      const colorScale = d3.scaleOrdinal()
      .domain(["2-Point %", "3-Point %", "Effective FG %"])
      .range(['#4e79a7', '#e15759', '#59a14f']);

      // X-axis
      svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .style('font-size', '7px')
      .attr("transform", "rotate(-70)");
            
      
      // Y-axis
      svg.append('g')
      .call(d3.axisLeft(yScale))
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));
    
      // Y-axis label
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -50)
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Shooting Percentage');

        //create grouped bars
        svg.append('g')
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', d => `translate(${xScale(d.team)},0)`)
        .selectAll('rect')
        .data(d => [
          { key: 'twoPoint', value: d.twopoint },
          { key: 'threePoint', value: d.threepoint },
          { key: 'effectiveFG', value: d.overall }            ])
        .enter()
        .append('rect')
        .attr('x', d => barScale(d.key))
        .attr('y', d => yScale(d.value))
        .attr('width', barScale.bandwidth())
        .attr('height', d => height - yScale(d.value))
        .attr('fill', d => colorScale(d.key));

            // Add Legend
  //   const legend = svg.append('g')
  //   .attr('transform', `translate(${width - 150}, ${height + 50})`);

  // const legendItems = [
  //   { key: 'twoPoint', label: '2-Point %' },
  //   { key: 'threePoint', label: '3-Point %' },
  //   { key: 'effectiveFG', label: 'Effective FG%' }
  // ];

  // legendItems.forEach((item, i) => {
  //   const legendGroup = legend.append('g')
  //     .attr('transform', `translate(0, ${i * 20})`);

  //   legendGroup.append('rect')
  //     .attr('width', 15)
  //     .attr('height', 15)
  //     .attr('fill', colorScale(item.key));

  //   legendGroup.append('text')
  //     .attr('x', 20)
  //     .attr('y', 12)
  //     .text(item.label);
  // });
    };


  render() {
    const styles = {
      container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f8f8e8',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderRadius: '8px',
        color: '#333',
        fontWeight: 'bold',
        border: '2px dashed #dada86'
      },
      title: {
        marginBottom: '10px',
        fontSize: '1.2rem'
      },
      subtitle: {
        fontSize: '0.9rem',
        color: '#666'
      }
    };

    return (
      <div style={styles.container}>
        <div style={styles.title}>Shooting Stacked Bar Chart</div>
        <div style={styles.subtitle}>NCAA Basketball Team Shooting Percentages</div>
        <div style={styles.chartContainer}>
          <svg ref={this.chartRef}></svg>
        </div>
      </div>
    );
  }
}

export default ShootingStackedBar;