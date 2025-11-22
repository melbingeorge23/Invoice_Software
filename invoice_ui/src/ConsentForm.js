import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import './ConsentForm.css';

const ConsentForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phone1: '',
    phone2: '',
    dob: '',
    address: '',
    tubeId: '',
    tests: [],
    clinicId: '',
    providerName: '',
    agreed: false
  });

  const [activeGuide, setActiveGuide] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const testOptions = [
    'GSA',
    'EXOME',
    'Human WGS-10X',
    'Human WGS-30X',
    'Gut Bacteria',
    'Microbiome Profile'
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone1) newErrors.phone1 = 'Phone number is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.tubeId) newErrors.tubeId = 'Tube ID is required';
    if (formData.tests.length === 0) newErrors.tests = 'At least one test is required';
    if (!formData.clinicId) newErrors.clinicId = 'Clinic ID is required';
    if (!formData.providerName) newErrors.providerName = 'Provider name is required';
    if (!formData.agreed) newErrors.agreed = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;

  //   if (type === 'checkbox') {
  //     setFormData(prev => {
  //       const newTests = checked
  //         ? [...prev.tests, value]
  //         : prev.tests.filter(test => test !== value);
  //       return { ...prev, tests: newTests };
  //     });
  //   } else {
  //     setFormData(prev => ({ ...prev, [name]: value }));
  //   }

  //   // Clear error when field is edited
  //   if (errors[name]) {
  //     setErrors(prev => ({ ...prev, [name]: '' }));
  //   }
  // };

  const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  if (type === 'checkbox') {
    if (name === 'tests') {
      // Handle test checkboxes
      setFormData(prev => {
        const newTests = checked
          ? [...prev.tests, value]
          : prev.tests.filter(test => test !== value);
        return { ...prev, tests: newTests };
      });
    } else {
      // Handle single checkboxes like 'agreed'
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
  } else {
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // Clear error when field is edited
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};

  const EMAILJS_PUBLIC_KEY = 'y_W3OvGTjDxqjmk02';
  const EMAILJS_SERVICE_ID = 'service_0k4s88a';
  const EMAILJS_TEMPLATE_ID = 'template_avhk00e';
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    if (!validateForm()) return;

    setIsSubmitting(true);


    try {
      // Prepare the email data
      const emailData = {
        patient_name: `${formData.firstName} ${formData.lastName}`,
        patient_email: formData.email,
        patient_phone: formData.phone1,
        patient_dob: formData.dob,
        tube_id: formData.tubeId,
        tests_requested: formData.tests.join(', '),
        clinic_id: formData.clinicId,
        provider_name: formData.providerName,
        submission_date: new Date().toLocaleDateString(),
        // Add any other fields you want to include in the email
      };

      // Send email using EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        emailData,
        EMAILJS_PUBLIC_KEY 
      );

      // Log to console (for debugging)
      console.log('Form submitted and email sent:', formData);
      
      // Show success message
      showSuccessMessage();
      
      // Optionally reset the form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        gender: '',
        email: '',
        phone1: '',
        phone2: '',
        dob: '',
        address: '',
        tubeId: '',
        tests: [],
        clinicId: '',
        providerName: '',
        agreed: false
      });
      
    } catch (error) {
      console.error('Submission error:', error);
      // Show error message to user
      alert('There was an error submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const showSuccessMessage = () => {
    const successEl = document.createElement('div');
    successEl.className = 'form-success-message';
    successEl.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <span>Form submitted successfully!</span>
    `;
    document.body.appendChild(successEl);

    setTimeout(() => {
      successEl.classList.add('show');
    }, 10);

    setTimeout(() => {
      successEl.classList.remove('show');
      setTimeout(() => document.body.removeChild(successEl), 300);
    }, 3000);
  };

  const openGuideModal = (guide) => {
    setActiveGuide(guide);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveGuide(null);
  };

  return (
    <div className="consent-form-container">
      <div className="form-header">
        <h1>Patient Details</h1>
      </div>

      <form onSubmit={handleSubmit} className="consent-form">
        <div className="form-grid">
          <div className="form-group">
            <label>
              <span className="label-number">1</span>
              Patient's First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Enter first name"
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label>
              <span className="label-number">2</span>
              Patient's Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Enter last name"
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>

          <div className="form-group">
            <label>
              <span className="label-number">3</span>
              Gender
            </label>
            <div className="radio-group">
              {['Male', 'Female', 'Other'].map((gender) => (
                <label key={gender} className="radio-option">
                  <input
                    type="radio"
                    name="gender"
                    value={gender.toLowerCase()}
                    checked={formData.gender === gender.toLowerCase()}
                    onChange={handleChange}
                    required
                  />
                  <span className="radio-custom"></span>
                  {gender}
                </label>
              ))}
            </div>
            {errors.gender && <span className="error-message">{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label>
              <span className="label-number">4</span>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="patient@example.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>
              <span className="label-number">5</span>
              Phone Number
            </label>
            <input
              type="tel"
              name="phone1"
              value={formData.phone1}
              onChange={handleChange}
              required
              placeholder="(123) 456-7890"
              className={errors.phone1 ? 'error' : ''}
            />
            {errors.phone1 && <span className="error-message">{errors.phone1}</span>}
          </div>

          <div className="form-group">
            <label>
              <span className="label-number">6</span>
              Alternative Phone Number <span className="optional">(optional)</span>
            </label>
            <input
              type="tel"
              name="phone2"
              value={formData.phone2}
              onChange={handleChange}
              placeholder="(123) 456-7890"
            />
          </div>

          <div className="form-group">
            <label>
              <span className="label-number">7</span>
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className={errors.dob ? 'error' : ''}
            />
            {errors.dob && <span className="error-message">{errors.dob}</span>}
          </div>

          <div className="form-group full-width">
            <label>
              <span className="label-number">8</span>
              Shipping Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Street address, city, state, and ZIP code"
              rows="3"
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label>
              <span className="label-number">9</span>
              Tube ID
            </label>
            <input
              type="text"
              name="tubeId"
              value={formData.tubeId}
              onChange={handleChange}
              required
              placeholder="Enter tube identification"
              className={errors.tubeId ? 'error' : ''}
            />
            {errors.tubeId && <span className="error-message">{errors.tubeId}</span>}
          </div>

          <div className="form-group full-width">
            <label>
              <span className="label-number">10</span>
              Test(s) Requested
            </label>
            <div className="checkbox-grid">
              {testOptions.map((test, index) => (
                <label key={index} className="checkbox-option">
                  <input
                    type="checkbox"
                    name="tests"
                    value={test}
                    checked={formData.tests.includes(test)}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom"></span>
                  {test}
                </label>
              ))}
            </div>
            {errors.tests && <span className="error-message">{errors.tests}</span>}
          </div>

          <div className="form-group">
            <label>
              <span className="label-number">11</span>
              Clinic ID
            </label>
            <input
              type="text"
              name="clinicId"
              value={formData.clinicId}
              onChange={handleChange}
              required
              placeholder="Enter clinic identification"
              className={errors.clinicId ? 'error' : ''}
            />
            {errors.clinicId && <span className="error-message">{errors.clinicId}</span>}
          </div>

          <div className="form-group">
            <label>
              <span className="label-number">12</span>
              Provider Name
            </label>
            <input
              type="text"
              name="providerName"
              value={formData.providerName}
              onChange={handleChange}
              required
              placeholder="Doctor/Hospital/Clinic name"
              className={errors.providerName ? 'error' : ''}
            />
            {errors.providerName && <span className="error-message">{errors.providerName}</span>}
          </div>
        </div>

        <div className="terms-section">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
            Terms and Conditions
          </h3>

          <div className="guide-buttons">
            <button
              type="button"
              className="guide-btn"
              onClick={() => openGuideModal('saliva')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Saliva Collection Guide
            </button>

            <button
              type="button"
              className="guide-btn"
              onClick={() => openGuideModal('consent')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Informed Consent
            </button>

            <button
              type="button"
              className="guide-btn"
              onClick={() => openGuideModal('rejection')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Rejection Criteria
            </button>
          </div>

          {/* <label>
            <input
              type="checkbox"
              name="agreed"
              checked={formData.agreed}
              onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
              required
            />
            <span className="checkbox-custom"></span>
            <span className="agree-text">
              I have read and agree to the terms and conditions above. I consent to genetic testing
              and understand how my sample and data will be used.
            </span>
          </label> */}
          <label className="agree-checkbox">
  <input
    type="checkbox"
    name="agreed"
    checked={formData.agreed}
    onChange={handleChange}
  />
  <span className="checkbox-custom"></span>
  <span className="agree-text">
    I have read and agree to the terms and conditions above. I consent to genetic testing
    and understand how my sample and data will be used.
  </span>
</label>
          {errors.agreed && <span className="error-message">{errors.agreed}</span>}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="spinner" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                </svg>
                Processing...
              </>
            ) : (
              <>
                
                Submit Consent Form
              </>
            )}
          </button>
          <p className="form-disclaimer">
            Your information is protected and will only be used for testing purposes.
          </p>
        </div>
      </form>

      {/* Modal for Guides */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>

            {activeGuide === 'saliva' && (
              <>
                <h3 className="modal-title">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Saliva Sample Collection Guide
                </h3>
                <div className="modal-body">
                  <ol>
                    <li>Do not drink alcohol, smoke, chew gum, brush your teeth, or use mouthwash for at least 2 hours prior to providing your sample.</li>
                    <li>Rinse your mouth thoroughly with water thrice, just before providing the sample.</li>
                    <li>Rub the cheek by palm from the outside and pool the saliva in the mouth.</li>
                    <li>
                      Collect the recommended volume of saliva 2 ml, in the container (upto a level, slightly below the black arrow mark present on the sticker).
                      Open the small vial/tube provided and empty the liquid contents in this container containing saliva.
                      Swirl gently 5-10 times to mix the saliva and the liquid. You may discard the small tube or place it with lid closed back in the saliva box and we will discard it for you.
                    </li>
                    <li>Cap securely and place the container in the plastic specimen bag, and then place the bag directly into the box.</li>
                    <li>
                      Your saliva sample is stable at a wide range of temperatures once it is mixed with the DNA stabilization buffer liquid, which could be blue in colour.
                      We recommend that you ship your collected sample and completely filled TRF form to the laboratory at your earliest convenience.
                      Till then the box can be kept at room temperature. Store in dark place.
                    </li>
                  </ol>
                </div>
              </>
            )}

            {activeGuide === 'consent' && (
              <>
                <h3 className="modal-title">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Informed Consent for Genetic Testing
                </h3>
                <div className="modal-body">
                  <p>By agreeing to these terms, you acknowledge and accept the following conditions:</p>
                  <ul>
                    <li>In these terms of contract, "sample" will mean the specimen accepted by lab for the purpose of genetic testing. "Requestor" refers to the physician or Laboratory requesting the test, as specified in the Test Request Form.</li>
                    <li>The purpose of the DNA analysis is to assess the probability of having an inherited genetic predisposition for the test prescribed. The non-detection of specific mutations does not rule out the possibility of increased risk for the genetic predisposition to a particular health condition.</li>
                    <li>The standard fee will cover:
                      <ol type="i">
                        <li>The genetic test</li>
                        <li>Analysis of the test result</li>
                        <li>The test report counselling</li>
                      </ol>
                    </li>
                    <li>Testing will only be carried out when:
                      <ol type="i">
                        <li>The submission form is received, filled out as requested</li>
                        <li>All the samples required are received in good condition</li>
                      </ol>
                    </li>
                    <li>The "Requestor" is responsible for getting informed consent from the Individual whose sample is analysed.</li>
                    <li>Once registration forms and samples are received, these will be deemed to constitute an order to carry out testing.</li>
                    <li>Laboratory reserves the right to request more samples, especially, but not exclusively, in cases where the sample taken does not comply with the volume specified in the instructions issued, or where the integrity of the sample is in doubt.</li>
                    <li>Laboratory will take all reasonable steps to produce a report within the stipulated time, but cannot accept responsibility for any delays especially, due to reasons, beyond control of Laboratory.</li>
                    <li>Laboratory will send a copy of the test report to the Requestor. In all other respects lab will keep the results confidential, and will not submit them to any other party. Laboratory will carry out the test only on the understanding that the Requestor will make the report available to all persons who consented for a DNA sample to be analysed.</li>
                    <li>Laboratory is not responsible for the authenticity of the samples provided for testing.</li>
                    <li>Laboratory is not responsible for any psychological, legal or practical consequences of the test.</li>
                    <li>Laboratory assures that the sample will only be used for the test indicated by the requestor, who can ask to destroy the sample at any time.</li>
                  </ul>
                </div>
              </>
            )}

            {activeGuide === 'rejection' && (
              <>
                <h3 className="modal-title">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Criteria for Specimen Rejection
                </h3>
                <div className="modal-body">
                  <p>The following is a general listing of common situations in which a specimen may be rejected for processing.</p>

                  <h4>I. REJECTION IN PREANALYTICAL STAGE</h4>
                  <ol type="A">
                    <li><strong>Improperly labelled specimens</strong>
                      <ol>
                        <li>Specimens not labelled</li>
                        <li>Specimens labelled with the incorrect patient identification</li>
                        <li>Specimens that do not match the patient information on the test requisition form (These specimens may be accepted after responsible individual communicates in writing about the correct identification)</li>
                        <li>Mismatch barcodes on TRF and specimen</li>
                      </ol>
                    </li>

                    <li><strong>Improper Collection</strong>
                      <ol>
                        <li>Specimens collected in non-recommended collection kit</li>
                        <li>Quantity of specimen insufficient to perform testing</li>
                        <li>Specimens which are obviously or subsequently prove to be contaminated</li>
                        <li>Uncapped or unsterile collection container</li>
                      </ol>
                    </li>

                    <li><strong>Non recommended specimen</strong>
                      <ol>
                        <li>Specimen that is not recommended for a particular test will be rejected</li>
                      </ol>
                    </li>

                    <li><strong>Specimens inappropriately transported to the laboratory</strong>
                      <ol>
                        <li>Specimens not in compliance with Universal Precautions (e.g., not bagged, not packed in a collection kit, not sealed appropriately)</li>
                        <li>Specimens leaking or grossly contaminated on the exterior portion of container</li>
                        <li>Damaged sample vials, damaged container, mixed samples will be rejected</li>
                      </ol>
                    </li>

                    <li><strong>Specimens received without appropriate paperwork</strong>
                      <ol>
                        <li>Specimen received without Test requisition form and essential information (Patient name, Age, gender, test requested, sample type and container)</li>
                      </ol>
                      <p><em>NOTE: Notification will be made to the responsible party and the specimens will be held till the required information is made available.</em></p>
                    </li>
                  </ol>

                  <h4>II. REJECTION IN ANALYTICAL STAGE</h4>
                  <p>If the DNA obtained from sample is:</p>
                  <ol type="i">
                    <li>Having insufficient concentration to proceed for genotyping, or</li>
                    <li>Contains inhibitory substances that subsequently affect data quality</li>
                  </ol>
                  <p>In such cases sample may get rejected/or put on processing hold in analytical stage until fresh additional sample is received.</p>
                  <p><em>NOTE: Notification will be made to the responsible requester and the specimens will be held till the fresh sample is received.</em></p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentForm;