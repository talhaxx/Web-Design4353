import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { fetchReportData, fetchReportDataDetail } from '../services/api';
import './ReportingModule.css';

const ReportingModule = () => {
  const { user } = useContext(AuthContext);
  const [reportType, setReportType] = useState('volunteers');
  const [reportFormat, setReportFormat] = useState('json');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setError('Access Denied: Only administrators can access the reporting module.');
    }
  }, [user]);

  // Fetch report data
  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData(null);
    setError('');
    setSuccessMessage('');
    setSelectedItemId(null);
    setDetailData(null);

    try {
      console.log(`Attempting to fetch ${reportType} report with format ${reportFormat}`);
      const data = await fetchReportData(reportType, reportFormat);
      console.log('Report API response:', data);
      
      if (data.success === false) {
        // Handle explicit error response
        setError(data.error || 'Failed to generate report. Please try again.');
        return;
      }
      
      if (reportFormat === 'json') {
        // Check if data exists and is an array
        if (data.data && Array.isArray(data.data)) {
          if (data.data.length === 0) {
            setReportData([]);
            setSuccessMessage(`No ${reportType} records found.`);
          } else {
            setReportData(data.data);
            setSuccessMessage(`${reportType} report generated successfully`);
          }
        } else {
          // If data structure is unexpected, show error
          console.error('Unexpected data format:', data);
          setError('Received invalid data from server. Please try again.');
        }
      } else {
        // For PDF and CSV, the response is handled by the browser directly
        // We just show a success message
        setSuccessMessage(`${reportType} report downloaded successfully`);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle download report in different formats
  const handleDownload = async (format) => {
    try {
      setLoading(true);
      // Use fetchReportData with format parameter - this now handles download correctly
      await fetchReportData(reportType, format);
      setSuccessMessage(`${reportType} report download initiated. Please check your downloads.`);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError(`Failed to download ${format.toUpperCase()} report. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed report for a specific item
  const handleViewDetail = async (itemId) => {
    setSelectedItemId(itemId);
    setLoadingDetail(true);
    setDetailData(null);

    try {
      // Determine which detail endpoint to use based on report type
      const detailType = reportType === 'volunteers' ? 'volunteer' : 'event';
      const data = await fetchReportDataDetail(detailType, itemId);
      setDetailData(data.data);
    } catch (err) {
      console.error('Error loading detail:', err);
      setError(`Failed to load ${reportType === 'volunteers' ? 'volunteer' : 'event'} details.`);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle download for a specific detail report
  const handleDownloadDetail = (format) => {
    if (!selectedItemId) return;

    const detailType = reportType === 'volunteers' ? 'volunteer' : 'event';
    const baseUrl = `/api/reports/${detailType}/${selectedItemId}?format=${format}`;
    window.open(baseUrl, '_blank');
  };

  return (
    <div className="reporting-module">
      <h1 className="reporting-title">Administrative Reporting</h1>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      {user && user.role === 'admin' ? (
        <div className="reporting-content">
          <div className="report-controls">
            <div className="control-group">
              <label>Report Type:</label>
              <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                disabled={loading}
              >
                <option value="volunteers">Volunteer Participation</option>
                <option value="events">Event Management</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>Format:</label>
              <select 
                value={reportFormat} 
                onChange={(e) => setReportFormat(e.target.value)}
                disabled={loading}
              >
                <option value="json">On-screen (JSON)</option>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            
            <button 
              className="generate-btn"
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
          
          {reportFormat === 'json' && reportData && (
            <div className="report-results">
              <div className="report-header">
                <h2>{reportType === 'volunteers' ? 'Volunteer Participation Report' : 'Event Management Report'}</h2>
                <div className="download-options">
                  <button onClick={() => handleDownload('pdf')} className="download-btn pdf">
                    Download as PDF
                  </button>
                  <button onClick={() => handleDownload('csv')} className="download-btn csv">
                    Download as CSV
                  </button>
                </div>
              </div>
              
              {reportType === 'volunteers' && (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Skills</th>
                        <th>Events Participated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((volunteer) => (
                        <tr key={volunteer.UserID}>
                          <td>{volunteer.FullName}</td>
                          <td>{volunteer.Email}</td>
                          <td>{volunteer.Skills || 'None'}</td>
                          <td>{volunteer.EventsParticipated || 'None'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {reportType === 'events' && (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Event Name</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Urgency</th>
                        <th>Volunteers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((event) => (
                        <tr key={event.EventID}>
                          <td>{event.EventName}</td>
                          <td>{new Date(event.EventDate).toLocaleDateString()}</td>
                          <td>{event.Location}</td>
                          <td>{event.Urgency}/5</td>
                          <td>{event.AssignedVolunteers || 'None'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Detail View */}
          {selectedItemId && (
            <div className="detail-view">
              <div className="detail-header">
                <h3>
                  {reportType === 'volunteers' 
                    ? `Volunteer Details: ${detailData?.volunteer?.FirstName} ${detailData?.volunteer?.LastName}`
                    : `Event Details: ${detailData?.event?.EventName}`
                  }
                </h3>
                <div className="download-options">
                  <button onClick={() => handleDownloadDetail('pdf')} className="download-btn pdf">
                    Download as PDF
                  </button>
                  <button onClick={() => handleDownloadDetail('csv')} className="download-btn csv">
                    Download as CSV
                  </button>
                </div>
              </div>
              
              {loadingDetail ? (
                <p className="loading-text">Loading details...</p>
              ) : detailData ? (
                <div className="detail-content">
                  {reportType === 'volunteers' && (
                    <>
                      <div className="detail-section">
                        <h4>Volunteer Information</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">{`${detailData.volunteer.FirstName} ${detailData.volunteer.LastName}`}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{detailData.volunteer.Email}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Phone:</span>
                            <span className="detail-value">{detailData.volunteer.Phone || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Skills:</span>
                            <span className="detail-value">{detailData.volunteer.Skills || 'None'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Join Date:</span>
                            <span className="detail-value">{new Date(detailData.volunteer.JoinDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="detail-section">
                        <h4>Participation History</h4>
                        {detailData.history.length > 0 ? (
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Event Name</th>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detailData.history.map((event) => (
                                <tr key={event.HistoryID}>
                                  <td>{event.EventName}</td>
                                  <td>{new Date(event.EventDate).toLocaleDateString()}</td>
                                  <td>{event.Location}</td>
                                  <td>{event.Status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="no-data">No participation history available.</p>
                        )}
                      </div>
                    </>
                  )}
                  
                  {reportType === 'events' && (
                    <>
                      <div className="detail-section">
                        <h4>Event Information</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Event Name:</span>
                            <span className="detail-value">{detailData.event.EventName}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Date:</span>
                            <span className="detail-value">{new Date(detailData.event.EventDate).toLocaleDateString()}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Location:</span>
                            <span className="detail-value">{detailData.event.Location}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Required Skills:</span>
                            <span className="detail-value">{detailData.event.RequiredSkills || 'None'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Urgency:</span>
                            <span className="detail-value">{detailData.event.Urgency}/5</span>
                          </div>
                          <div className="detail-item full-width">
                            <span className="detail-label">Description:</span>
                            <span className="detail-value">{detailData.event.Description}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="detail-section">
                        <h4>Assigned Volunteers</h4>
                        {detailData.volunteers.length > 0 ? (
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Skills</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detailData.volunteers.map((volunteer) => (
                                <tr key={volunteer.UserID}>
                                  <td>{`${volunteer.FirstName} ${volunteer.LastName}`}</td>
                                  <td>{volunteer.Email}</td>
                                  <td>{volunteer.Phone || 'N/A'}</td>
                                  <td>{volunteer.Skills || 'None'}</td>
                                  <td>{volunteer.Status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="no-data">No volunteers assigned to this event.</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="no-data">Failed to load details. Please try again.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="access-denied">
          <p>Access Denied: Only administrators can access the reporting module.</p>
        </div>
      )}
    </div>
  );
};

export default ReportingModule; 