import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const VerificationPage = () => {
  const { hash } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/certificates/verify-public/${hash}`);
        setResult({ valid: true, data: res.data?.data });
      } catch (err) {
        setResult({ valid: false });
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [hash]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;

  return (
    <div className="container text-center py-5">
      {result.valid ? (
        <div className="alert alert-success">
          <h3>✅ Verified Certificate</h3>
          <p><strong>Child Name:</strong> {result.data.child_name}</p>
          <p><strong>Unique ID:</strong> {result.data.unique_child_id}</p>
          <p><strong>Vaccination Status:</strong> {result.data.completed} / {result.data.total} vaccines completed</p>
          <p><strong>Certificate ID:</strong> {result.data.certificate_id}</p>
          <p className="text-muted">This certificate is authentic and valid.</p>
        </div>
      ) : (
        <div className="alert alert-danger">
          <h3>❌ Invalid or Expired Certificate</h3>
          <p>This certificate could not be verified. It may be fake or revoked.</p>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;