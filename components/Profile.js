import { useState } from "react";
import "./Profile.css"; // Ensure the CSS is imported

function Profile() {
  const [fullName, setFullName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [skills, setSkills] = useState([]);
  const [preferences, setPreferences] = useState("");
  const [availability, setAvailability] = useState("");

  return (
    <div className="profile-container">
      <h2 className="profile-title">Profile Management Form</h2>

      <form className="profile-form">
        {/* Full Name */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
          />
        </div>

        {/* Address */}
        <div className="form-group">
          <label>Address 1</label>
          <input
            type="text"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            placeholder="1234 Park Avenue"
          />
        </div>

        <div className="form-group">
          <label>Address 2 (Optional)</label>
          <input
            type="text"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            placeholder="Apartment, Suite, etc."
          />
        </div>

        {/* City & State */}
        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Houston"
          />
        </div>

        <div className="form-group">
          <label>Select State</label>
          <select value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">Select State</option>
            <option value="TX">Texas</option>
            <option value="NY">New York</option>
            <option value="CA">California</option>
          </select>
        </div>

        {/* Zip Code */}
        <div className="form-group">
          <label>Zip Code</label>
          <input
            type="text"
            className={`zip-input ${
              zipCode.length > 0 && !/^\d{5,9}$/.test(zipCode)
                ? "error-border"
                : ""
            }`}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="Enter Zip Code"
          />
          {zipCode.length > 0 && !/^\d{5,9}$/.test(zipCode) && (
            <p className="error-text">Invalid zip code</p>
          )}
        </div>

        {/* Skills (Multi-Select) */}
        <div className="form-group">
          <label>Select Skills</label>
          <select
            multiple
            value={skills}
            onChange={(e) =>
              setSkills([...e.target.selectedOptions].map((opt) => opt.value))
            }
          >
            <option value="First Aid">First Aid</option>
            <option value="Packing">Packing</option>
            <option value="Assisting">Assisting</option>
            <option value="Event Management">Event Management</option>
          </select>
        </div>

        {/* Preferences */}
        <div className="form-group">
          <label>Preferences</label>
          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="Enter your preferences"
          />
        </div>

        {/* Availability (Date Picker) */}
        <div className="form-group">
          <label>Availability</label>
          <input
            type="date"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button className="submit-button">Save Profile</button>
      </form>
    </div>
  );
}

export default Profile;
