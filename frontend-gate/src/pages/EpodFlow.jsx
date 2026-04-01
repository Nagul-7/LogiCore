import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { PackageOpen, AlertTriangle, CheckCircle, Upload } from 'lucide-react';

export default function EpodFlow() {
    const navigate = useNavigate();
    const { activeTripParams } = useStore();
    const [trip, setTrip] = useState(null);
    const [action, setAction] = useState(null); // 'match', 'discrepancy'

    // Discrepancy form state
    const [issueType, setIssueType] = useState('Missing Items');
    const [notes, setNotes] = useState('');
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        if (!activeTripParams?.trip_id) {
            navigate('/');
            return;
        }
        api.get(`/trips/${activeTripParams.trip_id}`).then(res => setTrip(res.data)).catch(e => console.error(e));
    }, [activeTripParams, navigate]);

    const handleConfirm = async () => {
        try {
            await api.post('/epods', { trip_id: trip.id, received_quantity_kg: trip.expected_quantity_kg });
            navigate('/');
        } catch (e) { }
    };

    const handleDiscrepancySubmit = async () => {
        try {
            const fd = new FormData();
            fd.append('trip_id', trip.id);
            fd.append('issue_type', issueType);
            fd.append('notes', notes);
            if (photo) fd.append('photo', photo);

            // POST /api/v1/epods/:id/discrepancy uses the epod id, but we don't have it yet since we didn't create the epod base row.
            // Let's create an ePOD row with discrepancy flag. Wait, backend route assumes epod ID.
            // For hackathon, let's just make an epod first, then discrepancy it.
            const res = await api.post('/epods', { trip_id: trip.id, received_quantity_kg: trip.expected_quantity_kg });
            await api.post(`/epods/${res.data.id}/discrepancy`, fd);

            navigate('/');
        } catch (e) { }
    };

    if (!trip) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Verify Material Receipt</h1>

            <div style={{ background: 'var(--color-card-bg)', borderRadius: '12px', border: '1px solid var(--color-card-border)', padding: '24px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid var(--color-card-border)', paddingBottom: '16px', marginBottom: '16px' }}>Manifest Details</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Supplier</p>
                        <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{trip.supplier_name}</p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Material Expected</p>
                        <p style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-primary-btn)' }}>{trip.expected_quantity_kg} kg - {trip.material_type}</p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Driver</p>
                        <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{trip.driver_name}</p>
                    </div>
                </div>
            </div>

            {!action && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <button onClick={() => handleConfirm()} style={{
                        padding: '24px', background: 'var(--color-success)', color: 'white', borderRadius: '12px',
                        border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
                    }}>
                        <CheckCircle size={48} />
                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Matches Manifest</span>
                        <span style={{ fontSize: '14px', opacity: 0.9 }}>Issue clean ePOD</span>
                    </button>

                    <button onClick={() => setAction('discrepancy')} style={{
                        padding: '24px', background: 'var(--color-danger)', color: 'white', borderRadius: '12px',
                        border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
                    }}>
                        <AlertTriangle size={48} />
                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Discrepancy</span>
                        <span style={{ fontSize: '14px', opacity: 0.9 }}>Report issue or damage</span>
                    </button>
                </div>
            )}

            {action === 'discrepancy' && (
                <div style={{ background: 'var(--color-card-bg)', borderRadius: '12px', border: '1px solid var(--color-danger)', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-danger)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle /> Report Discrepancy
                    </h3>

                    <label style={{ display: 'block', marginBottom: '16px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Issue Type</span>
                        <select value={issueType} onChange={e => setIssueType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-card-border)' }}>
                            <option>Missing Items</option>
                            <option>Damaged Goods</option>
                            <option>Wrong Material Type</option>
                            <option>Other</option>
                        </select>
                    </label>

                    <label style={{ display: 'block', marginBottom: '16px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Description / Notes</span>
                        <textarea rows="3" value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-card-border)' }} />
                    </label>

                    <label style={{ display: 'block', marginBottom: '32px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Photographic Evidence</span>
                        <div style={{ border: '2px dashed var(--color-card-border)', padding: '32px', textAlign: 'center', borderRadius: '8px', background: 'var(--color-page-bg)' }}>
                            <Upload size={32} color="var(--color-text-secondary)" style={{ marginBottom: '8px' }} />
                            <p style={{ color: 'var(--color-text-secondary)' }}>Click to upload evidence photo</p>
                            <input type="file" onChange={e => setPhoto(e.target.files[0])} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' }} />
                        </div>
                    </label>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={() => setAction(null)} style={{ flex: 1, padding: '16px', background: 'transparent', border: '1px solid var(--color-card-border)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleDiscrepancySubmit} style={{ flex: 1, padding: '16px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Exception & Generate ePOD</button>
                    </div>
                </div>
            )}
        </div>
    );
}
