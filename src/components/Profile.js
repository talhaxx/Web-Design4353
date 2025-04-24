import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { fetchUserProfile, updateUserProfile } from "../services/api";
import "./Profile.css"; // Ensure the CSS is imported
import api from '../services/api';

function Profile() {
  const { user } = useContext(AuthContext);
  const [fullName, setFullName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [skills, setSkills] = useState([]);
  const [preferences, setPreferences] = useState("");
  const [availability, setAvailability] = useState("");
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [availableDates, setAvailableDates] = useState([]);

  // Available skills options
  const skillOptions = [
    "First Aid",
    "Cooking",
    "Logistics",
    "Driving",
    "Teaching",
    "Event Planning",
    "Technical Support",
    "Construction",
    "Medical",
    "Administration"
  ];

  // Fetch user profile and states data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch states from the API
        const response = await api.get('/states');
        if (response.data && Array.isArray(response.data)) {
          setStates(response.data);
        }

        // Fetch user profile if logged in
        if (user && user.email) {
          const profileResponse = await fetchUserProfile(user.email);
          if (profileResponse.data) {
            const profile = profileResponse.data;
            setFullName(profile.FullName || "");
            // Split address if it contains address2
            if (profile.Address) {
              const addressParts = profile.Address.split('\n');
              setAddress1(addressParts[0] || "");
              setAddress2(addressParts.length > 1 ? addressParts[1] : "");
            }
            setCity(profile.City || "");
            setState(profile.State || "");
            setZipCode(profile.Zipcode || "");
            setSkills(profile.Skills ? profile.Skills.split(',') : []);
            setPreferences(profile.Preferences || "");
            
            // Parse availability dates
            if (profile.Availability) {
              try {
                setAvailableDates(JSON.parse(profile.Availability));
              } catch (e) {
                setAvailableDates([]);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const validateForm = () => {
    // Reset errors
    setError("");
    
    if (!fullName || fullName.length > 50) {
      setError("Full name is required and must be less than 50 characters");
      return false;
    }
    
    if (!address1 || address1.length > 100) {
      setError("Address is required and must be less than 100 characters");
      return false;
    }
    
    if (address2 && address2.length > 100) {
      setError("Address 2 must be less than 100 characters");
      return false;
    }
    
    if (!city || city.length > 100) {
      setError("City is required and must be less than 100 characters");
      return false;
    }
    
    if (!state) {
      setError("State selection is required");
      return false;
    }
    
    if (!zipCode || !/^\d{5}(\d{0,4})?$/.test(zipCode)) {
      setError("Valid zip code is required (5-9 digits)");
      return false;
    }
    
    if (!skills || skills.length === 0) {
      setError("At least one skill must be selected");
      return false;
    }
    
    if (availableDates.length === 0) {
      setError("At least one availability date is required");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Combine address parts
      const combinedAddress = address2 
        ? `${address1}\n${address2}` 
        : address1;
      
      const profileData = {
        email: user.email,
        fullName,
        address: combinedAddress,
        city,
        state,
        zip: zipCode,
        skills: skills.join(','),
        preferences,
        availability: JSON.stringify(availableDates)
      };
      
      await updateUserProfile(profileData);
      setSuccess("Profile updated successfully!");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    }
  };

  const handleDateSelect = (date) => {
    const dateString = date.target.value;
    // Toggle the date in the array
    if (availableDates.includes(dateString)) {
      setAvailableDates(availableDates.filter(d => d !== dateString));
    } else {
      setAvailableDates([...availableDates, dateString]);
    }
  };

  if (loading) {
    return <div className="profile-container"><p>Loading profile data...</p></div>;
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">Profile Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form className="profile-form" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="form-group">
          <label>Full Name <span className="required">*</span></label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            maxLength={50}
            required
          />
          <small>{fullName.length}/50 characters</small>
        </div>

        {/* Address 1 */}
        <div className="form-group">
          <label>Address 1 <span className="required">*</span></label>
          <input
            type="text"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            placeholder="1234 Park Avenue"
            maxLength={100}
            required
          />
          <small>{address1.length}/100 characters</small>
        </div>

        {/* Address 2 (Optional) */}
        <div className="form-group">
          <label>Address 2 (Optional)</label>
          <input
            type="text"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            placeholder="Apartment, Suite, etc."
            maxLength={100}
          />
          <small>{address2.length}/100 characters</small>
        </div>

        {/* City */}
        <div className="form-group">
          <label>City <span className="required">*</span></label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter City"
            maxLength={100}
            required
          />
          <small>{city.length}/100 characters</small>
        </div>

        {/* State Dropdown */}
        <div className="form-group">
          <label>State <span className="required">*</span></label>
          <select 
            value={state} 
            onChange={(e) => setState(e.target.value)} 
            required
          >
            <option value="">Select State</option>
            {states.map(stateOption => (
              <option key={stateOption.StateCode} value={stateOption.StateCode}>
                {stateOption.StateName}
              </option>
            ))}
          </select>
        </div>

        {/* Zip Code */}
        <div className="form-group">
          <label>Zip Code <span className="required">*</span></label>
          <input
            type="text"
            className={zipCode.length > 0 && !/^\d{5}(\d{0,4})?$/.test(zipCode) ? "error-border" : ""}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/[^\d]/g, '').substring(0, 9))}
            placeholder="Enter Zip Code (5-9 digits)"
            maxLength={9}
            required
          />
          {zipCode.length > 0 && !/^\d{5}(\d{0,4})?$/.test(zipCode) && (
            <small className="error-text">Please enter a valid 5-9 digit zip code</small>
          )}
        </div>

        {/* Skills Multi-Select */}
        <div className="form-group">
          <label>Skills <span className="required">*</span></label>
          <div className="checkbox-group">
            {skillOptions.map(skill => (
              <div key={skill} className="checkbox-item">
                <input
                  type="checkbox"
                  id={skill}
                  value={skill}
                  checked={skills.includes(skill)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSkills([...skills, skill]);
                    } else {
                      setSkills(skills.filter(s => s !== skill));
                    }
                  }}
                />
                <label htmlFor={skill}>{skill}</label>
              </div>
            ))}
          </div>
          {skills.length === 0 && <small className="error-text">At least one skill is required</small>}
        </div>

        {/* Preferences */}
        <div className="form-group">
          <label>Preferences</label>
          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="Enter your volunteering preferences"
            rows={4}
          />
        </div>

        {/* Availability Date Picker */}
        <div className="form-group">
          <label>Availability <span className="required">*</span></label>
          <div className="date-selector">
            <input
              type="date"
              onChange={handleDateSelect}
              min={new Date().toISOString().split('T')[0]}
            />
            {availableDates.length > 0 && (
              <div className="selected-dates">
                <h4>Selected Dates:</h4>
                <ul>
                  {availableDates.sort().map(date => (
                    <li key={date}>
                      {new Date(date).toLocaleDateString()}
                      <button 
                        type="button" 
                        onClick={() => setAvailableDates(availableDates.filter(d => d !== date))}
                        className="remove-date"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {availableDates.length === 0 && <small className="error-text">Please select at least one date</small>}
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-button">Save Profile</button>
      </form>
    </div>
  );
}

export default Profile;

