import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const WinsLineGraph = ({ data }) => {
  const [selectedTeam, setSelectedTeam] = useState("Virginia");
  const [avgWinPct, setAvgWinPct] = useState(0);
  const [avgPowerRating, setAvgPowerRating] = useState(0);
  const svgRef = useRef();

  useEffect(() => {
    const margin = { top: 25, right: 30, bottom: 60, left: 60 };
    const width = parseInt(d3.select(svgRef.current).style('width')) - margin.left - margin.right;
    const height = parseInt(d3.select(svgRef.current).style('height')) - margin.top - margin.bottom;


    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const teamData = data
      .filter((d) => d.team === selectedTeam)
      .sort((a, b) => a.season - b.season);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(teamData, (d) => d.season))
      .range([0, width]);

    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    chart.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
    chart.append("g").call(d3.axisLeft(y));

    chart
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .text("Season");

    chart
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .text("Win Percentage (%)");

    const line = d3
      .line()
      .x((d) => x(d.season))
      .y((d) => y((d.wins / d.games) * 100))
      .curve(d3.curveMonotoneX);

    chart
      .append("path")
      .datum(teamData)
      .attr("fill", "none")
      .attr("stroke", "#2980b9")
      .attr("stroke-width", 2)
      .attr("d", line);

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("padding", "8px")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("font-size", "0.8rem")
      .style("display", "none");

    const getColor = (rating) => {
      if (rating >= 0.97) return "#2ecc71";
      if (rating >= 0.95) return "#27ae60";
      if (rating >= 0.90) return "#f1c40f";
      if (rating >= 0.85) return "#e67e22";
      return "#e74c3c";
    };

    chart
      .selectAll("circle")
      .data(teamData)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.season))
      .attr("cy", (d) => y((d.wins / d.games) * 100))
      .attr("r", 5)
      .attr("fill", (d) => getColor(d.powerRating))
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(`
            <strong>Season:</strong> ${d.season}<br/>
            Games: ${d.games}<br/>
            Wins: ${d.wins}<br/>
            <strong>Win %:</strong> ${(d.wins / d.games * 100).toFixed(1)}%<br/>
            <strong>Power Rating:</strong> ${d.powerRating.toFixed(4)}<br/>
            <span style="color:${getColor(d.powerRating)}">${d.powerRating < 0.85 ? "Below Average team strength" : ""}</span>
          `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => tooltip.style("display", "none"));

    const avgWin = d3.mean(teamData, (d) => (d.wins / d.games) * 100);
    const avgPower = d3.mean(teamData, (d) => d.powerRating);
    setAvgWinPct(avgWin);
    setAvgPowerRating(avgPower);
  }, [selectedTeam, data]);

  const containerStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0e8f8',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    color: '#333',
    fontWeight: 'bold',
    border: '2px dashed #b086da',
    padding: '1rem',
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '0.5rem' }}>
        <label htmlFor="team">Team:&nbsp;</label>
        <select id="team" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
          {[...new Set(data.map((d) => d.team))].sort().map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.85rem', background: '#fff', padding: '8px', borderRadius: '6px' }}>
        <strong>Team Strength Legend (BARTHAG Rating)</strong>
        <div>
          <span style={{ color: '#e74c3c' }}>●</span> Below Average (0.78-0.85)&nbsp;
          <span style={{ color: '#e67e22' }}>●</span> Average (0.85-0.90)&nbsp;
          <span style={{ color: '#f1c40f' }}>●</span> Good (0.90-0.95)&nbsp;
          <span style={{ color: '#27ae60' }}>●</span> Strong (0.95-0.97)&nbsp;
          <span style={{ color: '#2ecc71' }}>●</span> Elite (0.97-0.99)
        </div>
      </div>

      <div style={{ marginTop: '0.5rem', background: '#eaf0ff', padding: '6px', borderRadius: '6px' }}>
        <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{selectedTeam}</span> - Average Win %: {avgWinPct.toFixed(1)}% | Power Rating: {avgPowerRating.toFixed(4)}
      </div>

      <svg ref={svgRef}></svg>
    </div>
  );
};

export default WinsLineGraph;
