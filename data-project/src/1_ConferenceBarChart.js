import React, { Component } from 'react';

class ConferenceBarChart extends Component {
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
        border: '2px dashed #86c5da'
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
        <div style={styles.title}>Conference Bar Chart</div>
        <div style={styles.subtitle}>Coming Soon</div>
      </div>
    );
  }
}

export default ConferenceBarChart;