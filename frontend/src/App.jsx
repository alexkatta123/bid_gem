import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, User, Hash, CheckCircle, Loader2, Sparkles } from 'lucide-react';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'M',
    sr_no: '',
    template: ''
  });
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('/api/templates');
        setTemplates(response.data);
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, template: response.data[0] }));
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };
    fetchTemplates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await axios.post('/api/generate', formData, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formData.name.replace(/\s+/g, '_')}_Certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const templateNames = {
    'gem_training_direct.pdf': 'Direct Order Certificate',
    'gem_training_intro.pdf': 'Introduction Certificate',
    'gem_training_tender.pdf': 'Tendering Certificate'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container"
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{ display: 'inline-block' }}
        >
          <Sparkles color="#6366f1" size={32} />
        </motion.div>
        <h1>GeM Certificate Generator</h1>
        <p className="subtitle">by Bhargav Ram Potluri</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Certificate Template</label>
          <select
            value={formData.template}
            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
            required
          >
            {templates.map(tmp => (
              <option key={tmp} value={tmp}>
                {templateNames[tmp] || tmp}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label><User size={14} style={{ marginRight: '4px' }} /> Participant Name</label>
          <input
            type="text"
            placeholder="Enter full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Gender Selection</label>
          <div className="gender-options">
            <button
              type="button"
              className={`gender-btn ${formData.gender === 'M' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, gender: 'M' })}
            >
              Male (Mr.)
            </button>
            <button
              type="button"
              className={`gender-btn ${formData.gender === 'F' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, gender: 'F' })}
            >
              Female (Ms.)
            </button>
          </div>
        </div>

        <div className="form-group">
          <label><Hash size={14} style={{ marginRight: '4px' }} /> Serial Number</label>
          <input
            type="text"
            placeholder="e.g. 001"
            value={formData.sr_no}
            onChange={(e) => setFormData({ ...formData, sr_no: e.target.value })}
            required
          />
        </div>

        <button 
          type="submit" 
          className="generate-btn"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="loading" size={20} />
          ) : success ? (
            <CheckCircle size={20} />
          ) : (
            <Download size={20} />
          )}
          {loading ? 'Generating...' : success ? 'Downloaded!' : 'Generate Certificate'}
        </button>
      </form>

      <div className="footer">
        Professional Edition • Built by <span>Bhargav Ram Potluri</span>
      </div>
    </motion.div>
  );
}

export default App;
