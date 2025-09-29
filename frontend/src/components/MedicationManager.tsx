import { useState, useEffect } from 'react';
import { getMedications, saveMedications } from '../lib/medicationStore';
import type { Medication } from '../lib/medicationStore';
import CameraView from './CameraView.js';

// Icon for manual add
const ManualIcon = () => (
  <svg className="w-6 h-6 text-blue-400 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" />
    <path d="M8 12h8M12 8v8" stroke="currentColor" strokeLinecap="round" />
  </svg>
);

export default function MedicationManager() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [schedule, setSchedule] = useState<string[]>(['']);

  // Load medications from local storage
  useEffect(() => {
    setMedications(getMedications());
  }, []);

  const handleAddTime = () => setSchedule([...schedule, '']);
  const handleRemoveTime = (index: number) => setSchedule(schedule.filter((_, i) => i !== index));
  const handleTimeChange = (index: number, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = value;
    setSchedule(newSchedule);
  };

  const resetForm = () => {
    setName('');
    setDosage('');
    setSchedule(['']);
    setEditingMedication(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med: Medication) => {
    setEditingMedication(med);
    setName(med.name);
    setDosage(med.dosage);
    setSchedule(med.schedule);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      const updatedMedications = medications.filter(med => med.id !== id);
      setMedications(updatedMedications);
      saveMedications(updatedMedications);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage || schedule.some(time => !time)) return;

    const updatedSchedule = schedule.filter(time => time);
    let updatedMedications;

    if (editingMedication) {
      updatedMedications = medications.map(med =>
        med.id === editingMedication.id
          ? { ...med, name, dosage, schedule: updatedSchedule }
          : med
      );
    } else {
      const newMedication: Medication = {
        id: new Date().toISOString() + name,
        name,
        dosage,
        schedule: updatedSchedule,
      };
      updatedMedications = [...medications, newMedication];
    }

    setMedications(updatedMedications);
    saveMedications(updatedMedications);
    setIsModalOpen(false);
    resetForm();
  };

  const handlePrescriptionScanned = (scannedMeds: Medication[]) => {
    if (scannedMeds.length === 0) {
      alert("No medications were found on the prescription.");
      return;
    }

    const newMedsToAdd = scannedMeds.filter(
      scannedMed => !medications.some(existingMed => existingMed.name.toLowerCase() === scannedMed.name.toLowerCase())
    );

    if (newMedsToAdd.length === 0) {
      alert("All medications from the scan are already in your list.");
      return;
    }

    const updatedMedications = [...medications, ...newMedsToAdd];
    setMedications(updatedMedications);
    saveMedications(updatedMedications);

    alert(`Successfully added ${newMedsToAdd.length} new medication(s) to your list!`);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-100">Your Medications</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-blue-100 font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 border border-blue-900/40"
          >
            <ManualIcon />
            Add Manually
          </button>
          <CameraView onPrescriptionScanned={handlePrescriptionScanned} />
        </div>
      </div>

      <div className="space-y-3 mb-24">
        {medications.length > 0 ? (
          medications.map(med => (
            <div key={med.id} className="p-4 bg-gradient-to-br from-blue-900/60 via-blue-950/80 to-gray-900/80 rounded-xl shadow flex justify-between items-center border border-blue-900/40">
              <div>
                <p className="font-semibold text-blue-100">{med.name} <span className="text-blue-300 font-normal">- {med.dosage}</span></p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {med.schedule.map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center justify-center w-16 h-8 rounded-full bg-blue-800/70 border border-blue-600 text-blue-100 font-semibold text-sm shadow"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEditModal(med)}
                  className="px-3 py-1 text-sm text-blue-200 bg-blue-800/60 rounded hover:bg-blue-700/80 border border-blue-900/40 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(med.id)}
                  className="px-3 py-1 text-sm text-red-200 bg-red-900/60 rounded hover:bg-red-700/80 border border-red-900/40 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 px-4 border-2 border-dashed border-blue-900/30 rounded-xl bg-blue-950/30">
            <p className="text-blue-300">No medications added yet.</p>
            <p className="text-sm text-blue-400 mt-2">Click <span className="font-bold">Add Manually</span> or use the scan icon to add your medications.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gradient-to-br from-blue-950/90 via-blue-900/90 to-gray-900/90 rounded-2xl shadow-2xl border border-blue-800/60 p-8 relative">
            <button
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              className="absolute top-4 right-4 text-blue-200 hover:text-blue-400 transition"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-blue-100 mb-6 flex items-center">
              <ManualIcon />
              {editingMedication ? "Edit Medication" : "Add Medication"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-blue-200 font-semibold mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-blue-950/60 border border-blue-800 text-blue-100 placeholder-blue-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Paracetamol"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-200 font-semibold mb-1">Dosage</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-blue-950/60 border border-blue-800 text-blue-100 placeholder-blue-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={dosage}
                  onChange={e => setDosage(e.target.value)}
                  placeholder="e.g. 500mg"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-200 font-semibold mb-1">Schedule</label>
                <div className="space-y-2">
                  {schedule.map((time, idx) => {
                    const [hourPart, rest] = time.split(":");
                    const [minutePart, period] = rest?.split(" ") || ["00", "AM"];

                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-blue-950/60 border border-blue-800 rounded-full px-3 py-2 shadow">
                         <input
                            type="number"
                            min={1}
                            max={12}
                            value={parseInt(hourPart) || ""}
                            onChange={(e) => {
                              let val = parseInt(e.target.value);
                              if (isNaN(val)) val = 1;
                              if (val < 1) val = 1;
                              if (val > 12) val = 12;
                              handleTimeChange(idx, `${val.toString().padStart(2, "0")}:${minutePart} ${period}`);
                            }}
                            className="w-12 text-center bg-transparent outline-none text-blue-100 font-semibold"
                          />

                          <input
                            type="number"
                            min={0}
                            max={59}
                            value={parseInt(minutePart) || ""}
                            onChange={(e) => {
                              let val = parseInt(e.target.value);
                              if (isNaN(val)) val = 0;
                              if (val < 0) val = 0;
                              if (val > 59) val = 59;
                              handleTimeChange(idx, `${hourPart}:${val.toString().padStart(2, "0")} ${period}`);
                            }}
                            className="w-12 text-center bg-transparent outline-none text-blue-100 font-semibold"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              handleTimeChange(
                                idx,
                                `${hourPart}:${minutePart} ${period === "AM" ? "PM" : "AM"}`
                              )
                            }
                            className="ml-2 px-2 py-1 rounded-full bg-blue-700 text-blue-100 font-semibold hover:bg-blue-600 transition"
                          >
                            {period}
                          </button>
                        </div>

                        {schedule.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTime(idx)}
                            className="text-red-400 hover:text-red-600 transition p-1 rounded-full"
                            aria-label="Remove time"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleAddTime}
                    className="mt-2 flex items-center gap-1 text-blue-300 hover:text-blue-400 font-semibold transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                    </svg>
                    Add Time
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="px-5 py-2 rounded-lg bg-blue-900/60 text-blue-200 font-semibold hover:bg-blue-800/80 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white font-bold shadow hover:scale-105 hover:shadow-xl transition-all duration-200"
                >
                  {editingMedication ? "Save Changes" : "Add Medication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
