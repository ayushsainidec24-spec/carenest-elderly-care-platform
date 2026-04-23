import React, { useEffect, useState } from "react";
import api from "../api";

const initialForm = { name: "", service: "", rating: "" };

export default function Caregivers() {
  const [caregivers, setCaregivers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const loadCaregivers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/caregivers");
      setCaregivers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaregivers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post("/caregivers", form);
    setForm(initialForm);
    loadCaregivers();
  };

  const handleDelete = async (id) => {
    await api.delete(`/caregivers/${id}`);
    loadCaregivers();
  };

  return (
    <section>
      <h2>Caregivers</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <label>
          Name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          Service
          <input
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
            required
          />
        </label>
        <label>
          Rating
          <input
            type="number"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            min="0"
            max="5"
            step="0.1"
            required
          />
        </label>
        <button type="submit">Add caregiver</button>
      </form>

      {loading ? (
        <p>Loading caregivers…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Service</th>
              <th>Rating</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {caregivers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.service}</td>
                <td>{c.rating}</td>
                <td>
                  <button onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
