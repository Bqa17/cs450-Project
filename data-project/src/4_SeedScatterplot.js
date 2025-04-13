import React, { Component } from 'react';

class SeedScatterplot extends Component {
  render() {
    const styles = {
      container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e8f8e8',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '8px',
        color: '#333',
        fontWeight: 'bold',
        border: '2px dashed #86da86'
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
        <div style={styles.title}>Seed Scatterplot</div>
        <div style={styles.subtitle}>Coming Soon</div>
      </div>
    );
  }
}

export default SeedScatterplot;