// import React, { useState, useEffect } from "react";
// import "./AreaManagement.css";
// import {
//   getAreas,
//   createArea,
//   updateArea,
//   deleteArea,
//   Area,
//   CreateAreaPayload,
// } from "../../services/areaService";
// import DeleteModal from "../../components/Deletemodel";

// const emptyForm: CreateAreaPayload = {
//   name: "",
//   delivery_charge: 0,
//   min_order_value: 0,
//   is_active: true,
// };

// const AreaManagement: React.FC = () => {
//   // ===== STATE MANAGEMENT =====
//   const [areas, setAreas] = useState<Area[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   // Modal control state
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [editingArea, setEditingArea] = useState<Area | null>(null);

//   // Delete modal state
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
//   const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);

//   // Form payload state — mirrors CreateAreaPayload exactly (name, delivery_charge,
//   // min_order_value, is_active).
//   const [formData, setFormData] = useState<CreateAreaPayload>({ ...emptyForm });

//   // Form submission loading state
//   const [submitting, setSubmitting] = useState<boolean>(false);

//   // ===== EFFECTS =====
//   useEffect(() => {
//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (success) {
//       const timer = setTimeout(() => setSuccess(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [success]);

//   useEffect(() => {
//     if (error) {
//       const timer = setTimeout(() => setError(null), 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [error]);

//   // ===== API CALLS =====

//   /**
//    * Fetch areas from the backend.
//    * NOTE: GET /areas (getAreas) only ever returns areas the admin has
//    * created AND that are currently active (backend filters
//    * `is_active=True`), so this list naturally shows only "live" areas.
//    * Deactivating an area (soft delete) removes it from this list without
//    * destroying its row — reactivate it from the Area model / a dedicated
//    * "show inactive" view if you add one later.
//    */
//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await getAreas();
//       setAreas(data || []);
//     } catch (err: any) {
//       const errorMessage =
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Failed to fetch areas. Please try again.";
//       setError(errorMessage);
//       console.error("Fetch areas error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateOpen = () => {
//     setEditingArea(null);
//     setFormData({ ...emptyForm });
//     setIsModalOpen(true);
//   };

//   const handleEditOpen = (area: Area) => {
//     setEditingArea(area);
//     setFormData({
//       name: area.name,
//       delivery_charge: area.delivery_charge,
//       min_order_value: area.min_order_value,
//       is_active: area.is_active,
//     });
//     setIsModalOpen(true);
//   };

//   /**
//    * Handle form submission (both create and update).
//    * createArea/updateArea resolve to `{ message, area }` — the area itself
//    * is under `.area`, so we unwrap it before touching state.
//    */
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     if (!formData.name.trim()) {
//       setError("Area name is required");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       if (editingArea) {
//         const res = await updateArea(editingArea.id, formData);
//         const updatedArea: Area = res.area;
//         setAreas((prev) =>
//           prev.map((a) => (a.id === editingArea.id ? updatedArea : a))
//         );
//         setSuccess(`Area "${updatedArea.name}" updated successfully!`);
//       } else {
//         const res = await createArea(formData);
//         const createdArea: Area = res.area;
//         setAreas((prev) => [...prev, createdArea]);
//         setSuccess(`Area "${createdArea.name}" created successfully!`);
//       }

//       setIsModalOpen(false);
//       setFormData({ ...emptyForm });
//     } catch (err: any) {
//       const errorMessage =
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "An error occurred while saving.";
//       setError(errorMessage);
//       console.error("Submit error:", err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDeleteClick = (area: Area) => {
//     setAreaToDelete(area);
//     setIsDeleteModalOpen(true);
//   };

//   /**
//    * Backend DELETE /areas/<id> is a soft delete (sets is_active = False),
//    * so we just drop it from the local list — it still exists in the DB.
//    */
//   const handleConfirmDelete = async () => {
//     if (!areaToDelete) return;

//     try {
//       await deleteArea(areaToDelete.id);
//       setAreas((prev) => prev.filter((a) => a.id !== areaToDelete.id));
//       setSuccess(`Area "${areaToDelete.name}" deactivated successfully!`);
//       setIsDeleteModalOpen(false);
//       setAreaToDelete(null);
//     } catch (err: any) {
//       const errorMessage =
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Failed to delete the area.";
//       setError(errorMessage);
//       console.error("Delete error:", err);
//       setIsDeleteModalOpen(false);
//     }
//   };

//   /**
//    * Toggle active status via PUT (unwraps `.area` just like handleSubmit).
//    * Note: flipping an active area to inactive will make it disappear from
//    * this list on the next fetchData(), since GET /areas only returns
//    * is_active=True rows — that's expected soft-delete behaviour.
//    */
//   const handleToggleStatus = async (area: Area) => {
//     try {
//       const res = await updateArea(area.id, {
//         ...area,
//         is_active: !area.is_active,
//       });
//       const updatedArea: Area = res.area;
//       setAreas((prev) => prev.map((a) => (a.id === area.id ? updatedArea : a)));
//       setSuccess(
//         `Area "${area.name}" ${updatedArea.is_active ? "activated" : "deactivated"} successfully!`
//       );
//     } catch (err: any) {
//       const errorMessage =
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Failed to update status.";
//       setError(errorMessage);
//       console.error("Toggle status error:", err);
//     }
//   };

//   const handleFormChange = (field: keyof CreateAreaPayload, value: any) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   // ===== RENDER =====

//   return (
//     <div className="area-container">
//       {/* ===== HEADER SECTION ===== */}
//       <div className="area-header">
//         <div>
//           <h2>Area Management</h2>
//           <p>Manage delivery zones, pricing, and minimum order values.</p>
//         </div>
//         <button
//           className="btn-primary-area"
//           onClick={handleCreateOpen}
//           disabled={loading}
//         >
//           + Add New Area
//         </button>
//       </div>

//       {/* ===== ALERT MESSAGES ===== */}
//       {error && (
//         <div className="alert-error">
//           <span>{error}</span>
//           <button className="alert-close" onClick={() => setError(null)} aria-label="Close error">
//             ×
//           </button>
//         </div>
//       )}

//       {success && (
//         <div className="alert-success">
//           <span>{success}</span>
//           <button className="alert-close" onClick={() => setSuccess(null)} aria-label="Close success">
//             ×
//           </button>
//         </div>
//       )}

//       {/* ===== LOADING STATE / DATA TABLE ===== */}
//       {loading ? (
//         <div className="loading-state">
//           <div className="spinner"></div>
//           <p>Loading areas data...</p>
//         </div>
//       ) : (
//         <div className="table-responsive">
//           <table className="area-table">
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Area Name</th>
//                 <th>Delivery Charge</th>
//                 <th>Min Order Value</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {areas.length === 0 ? (
//                 <tr>
//                   <td colSpan={7} className="text-center no-data">
//                     No records found. Click "Add New Area" to get started.
//                   </td>
//                 </tr>
//               ) : (
//                 areas.map((area) => (
//                   <tr key={area.id} className={!area.is_active ? "inactive-row" : ""}>
//                     <td>#{area.id}</td>
//                     <td className="font-bold">{area.name}</td>
//                     <td>{area.delivery_charge.toFixed(3)}</td>
//                     <td>{area.min_order_value.toFixed(3)}</td>
//                     <td>
//                       <button
//                         className={`status-badge ${area.is_active ? "active" : "inactive"}`}
//                         onClick={() => handleToggleStatus(area)}
//                         title={area.is_active ? "Click to deactivate" : "Click to activate"}
//                       >
//                         {area.is_active ? "Active" : "Inactive"}
//                       </button>
//                     </td>
//                     <td>
//                       <div className="action-buttons">
//                         <button className="btn-edit" onClick={() => handleEditOpen(area)} title="Edit area">
//                           Edit
//                         </button>
//                         <button className="btn-delete" onClick={() => handleDeleteClick(area)} title="Delete area">
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* ===== CREATE/EDIT MODAL ===== */}
//       {isModalOpen && (
//         <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>{editingArea ? "Modify Area Details" : "Create New Area Zone"}</h3>
//               <button className="close-btn" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
//                 ×
//               </button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               {/* Area Name */}
//               <div className="form-group">
//                 <label htmlFor="area-name">
//                   Area Name <span className="required">*</span>
//                 </label>
//                 <input
//                   id="area-name"
//                   type="text"
//                   required
//                   value={formData.name}
//                   onChange={(e) => handleFormChange("name", e.target.value)}
//                   placeholder="e.g. Salmiya"
//                   disabled={submitting}
//                 />
//               </div>

//               {/* Delivery Charge & Min Order Value Row */}
//               <div className="form-row">
//                 <div className="form-group">
//                   <label htmlFor="area-delivery-charge">Delivery Charge</label>
//                   <input
//                     id="area-delivery-charge"
//                     type="number"
//                     min="0"
//                     step="0.001"
//                     value={formData.delivery_charge}
//                     onChange={(e) =>
//                       handleFormChange("delivery_charge", parseFloat(e.target.value) || 0)
//                     }
//                     placeholder="0.000"
//                     disabled={submitting}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="area-min-order">Min. Order Value</label>
//                   <input
//                     id="area-min-order"
//                     type="number"
//                     min="0"
//                     step="0.001"
//                     value={formData.min_order_value}
//                     onChange={(e) =>
//                       handleFormChange("min_order_value", parseFloat(e.target.value) || 0)
//                     }
//                     placeholder="0.000"
//                     disabled={submitting}
//                   />
//                 </div>
//               </div>

//               {/* Active toggle (only meaningful on create; edit uses the status badge) */}
//               {!editingArea && (
//                 <div className="form-group form-group-inline">
//                   <label htmlFor="area-active">
//                     <input
//                       id="area-active"
//                       type="checkbox"
//                       checked={!!formData.is_active}
//                       onChange={(e) => handleFormChange("is_active", e.target.checked)}
//                       disabled={submitting}
//                     />{" "}
//                     Active immediately
//                   </label>
//                 </div>
//               )}

//               {/* Modal Footer */}
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn-secondary"
//                   onClick={() => setIsModalOpen(false)}
//                   disabled={submitting}
//                 >
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn-primary" disabled={submitting}>
//                   {submitting ? (
//                     <>
//                       <span className="spinner-small"></span>
//                       Processing...
//                     </>
//                   ) : editingArea ? (
//                     "Save Changes"
//                   ) : (
//                     "Create Area"
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ===== DELETE CONFIRMATION MODAL ===== */}
//       <DeleteModal
//         isOpen={isDeleteModalOpen}
//         onClose={() => {
//           setIsDeleteModalOpen(false);
//           setAreaToDelete(null);
//         }}
//         onConfirm={handleConfirmDelete}
//         itemName={areaToDelete ? `the area "${areaToDelete.name}"` : "this area"}
//       />
//     </div>
//   );
// };

// export default AreaManagement;


import React, { useState, useEffect } from "react";
import "./AreaManagement.css";
import {
  getAllAreasAdmin,
  createArea,
  updateArea,
  deleteArea,
  Area,
  CreateAreaPayload,
} from "../../services/areaService";
import DeleteModal from "../../components/Deletemodel";

const emptyForm: CreateAreaPayload = {
  name: "",
  delivery_charge: 0,
  min_order_value: 0,
  is_active: true,
};

const AreaManagement: React.FC = () => {
  // ===== STATE MANAGEMENT =====
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal control state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);

  // Form payload state — mirrors CreateAreaPayload exactly (name, delivery_charge,
  // min_order_value, is_active).
  const [formData, setFormData] = useState<CreateAreaPayload>({ ...emptyForm });

  // Form submission loading state
  const [submitting, setSubmitting] = useState<boolean>(false);

  // ===== EFFECTS =====
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ===== API CALLS =====

  /**
   * Fetch areas from the backend.
   * NOTE: uses GET /areas/admin/all, which returns EVERY area
   * (active and inactive). This is deliberate — the public GET /areas
   * only returns is_active=True rows, so using that here would make
   * an area disappear from this table the moment you deactivate it,
   * with no way to switch it back on. The admin endpoint keeps
   * inactive areas visible (shown with the "Inactive" badge) so you
   * can still toggle them back to active.
   */
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAreasAdmin();
      setAreas(data || []);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch areas. Please try again.";
      setError(errorMessage);
      console.error("Fetch areas error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOpen = () => {
    setEditingArea(null);
    setFormData({ ...emptyForm });
    setIsModalOpen(true);
  };

  const handleEditOpen = (area: Area) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      delivery_charge: area.delivery_charge,
      min_order_value: area.min_order_value,
      is_active: area.is_active,
    });
    setIsModalOpen(true);
  };

  /**
   * Handle form submission (both create and update).
   * createArea/updateArea resolve to `{ message, area }` — the area itself
   * is under `.area`, so we unwrap it before touching state.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Area name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingArea) {
        const res = await updateArea(editingArea.id, formData);
        const updatedArea: Area = res.area;
        setAreas((prev) =>
          prev.map((a) => (a.id === editingArea.id ? updatedArea : a))
        );
        setSuccess(`Area "${updatedArea.name}" updated successfully!`);
      } else {
        const res = await createArea(formData);
        const createdArea: Area = res.area;
        setAreas((prev) => [...prev, createdArea]);
        setSuccess(`Area "${createdArea.name}" created successfully!`);
      }

      setIsModalOpen(false);
      setFormData({ ...emptyForm });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred while saving.";
      setError(errorMessage);
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (area: Area) => {
    setAreaToDelete(area);
    setIsDeleteModalOpen(true);
  };

  /**
   * Backend DELETE /areas/<id> now performs a REAL delete — the row is
   * removed from the database (not just deactivated). We drop it from
   * the local list on success. If the area is still referenced by
   * addresses/orders, the backend returns a 409 with a friendly message
   * asking you to deactivate it instead — that message is surfaced via
   * setError below.
   */
  const handleConfirmDelete = async () => {
    if (!areaToDelete) return;

    try {
      await deleteArea(areaToDelete.id);
      setAreas((prev) => prev.filter((a) => a.id !== areaToDelete.id));
      setSuccess(`Area "${areaToDelete.name}" deleted successfully!`);
      setIsDeleteModalOpen(false);
      setAreaToDelete(null);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete the area.";
      setError(errorMessage);
      console.error("Delete error:", err);
      setIsDeleteModalOpen(false);
    }
  };

  /**
   * Toggle active status via PUT (unwraps `.area` just like handleSubmit).
   * Because fetchData now uses the admin "all areas" endpoint, flipping
   * an area to inactive keeps it in this table (shown as "Inactive")
   * instead of disappearing — you can click it again to reactivate.
   */
  const handleToggleStatus = async (area: Area) => {
    try {
      const res = await updateArea(area.id, {
        ...area,
        is_active: !area.is_active,
      });
      const updatedArea: Area = res.area;
      setAreas((prev) => prev.map((a) => (a.id === area.id ? updatedArea : a)));
      setSuccess(
        `Area "${area.name}" ${updatedArea.is_active ? "activated" : "deactivated"} successfully!`
      );
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update status.";
      setError(errorMessage);
      console.error("Toggle status error:", err);
    }
  };

  const handleFormChange = (field: keyof CreateAreaPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ===== RENDER =====

  return (
    <div className="area-container">
      {/* ===== HEADER SECTION ===== */}
      <div className="area-header">
        <div>
          <h2>Area Management</h2>
          <p>Manage delivery zones, pricing, and minimum order values.</p>
        </div>
        <button
          className="btn-primary-area"
          onClick={handleCreateOpen}
          disabled={loading}
        >
          + Add New Area
        </button>
      </div>

      {/* ===== ALERT MESSAGES ===== */}
      {error && (
        <div className="alert-error">
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError(null)} aria-label="Close error">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="alert-success">
          <span>{success}</span>
          <button className="alert-close" onClick={() => setSuccess(null)} aria-label="Close success">
            ×
          </button>
        </div>
      )}

      {/* ===== LOADING STATE / DATA TABLE ===== */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading areas data...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="area-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Area Name</th>
                <th>Delivery Charge</th>
                <th>Min Order Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {areas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center no-data">
                    No records found. Click "Add New Area" to get started.
                  </td>
                </tr>
              ) : (
                areas.map((area) => (
                  <tr key={area.id} className={!area.is_active ? "inactive-row" : ""}>
                    <td>#{area.id}</td>
                    <td className="font-bold">{area.name}</td>
                    <td>{area.delivery_charge.toFixed(3)}</td>
                    <td>{area.min_order_value.toFixed(3)}</td>
                    <td>
                      <button
                        className={`status-badge ${area.is_active ? "active" : "inactive"}`}
                        onClick={() => handleToggleStatus(area)}
                        title={area.is_active ? "Click to deactivate" : "Click to activate"}
                      >
                        {area.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEditOpen(area)} title="Edit area">
                          Edit
                        </button>
                        <button className="btn-delete" onClick={() => handleDeleteClick(area)} title="Delete area">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== CREATE/EDIT MODAL ===== */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingArea ? "Modify Area Details" : "Create New Area Zone"}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Area Name */}
              <div className="form-group">
                <label htmlFor="area-name">
                  Area Name <span className="required">*</span>
                </label>
                <input
                  id="area-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="e.g. Salmiya"
                  disabled={submitting}
                />
              </div>

              {/* Delivery Charge & Min Order Value Row */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="area-delivery-charge">Delivery Charge</label>
                  <input
                    id="area-delivery-charge"
                    type="number"
                    min="0"
                    step="0.001"
                    value={formData.delivery_charge}
                    onChange={(e) =>
                      handleFormChange("delivery_charge", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.000"
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="area-min-order">Min. Order Value</label>
                  <input
                    id="area-min-order"
                    type="number"
                    min="0"
                    step="0.001"
                    value={formData.min_order_value}
                    onChange={(e) =>
                      handleFormChange("min_order_value", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.000"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Active toggle (only meaningful on create; edit uses the status badge) */}
              {!editingArea && (
                <div className="form-group form-group-inline">
                  <label htmlFor="area-active">
                    <input
                      id="area-active"
                      type="checkbox"
                      checked={!!formData.is_active}
                      onChange={(e) => handleFormChange("is_active", e.target.checked)}
                      disabled={submitting}
                    />{" "}
                    Active immediately
                  </label>
                </div>
              )}

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-small"></span>
                      Processing...
                    </>
                  ) : editingArea ? (
                    "Save Changes"
                  ) : (
                    "Create Area"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAreaToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={areaToDelete ? `the area "${areaToDelete.name}"` : "this area"}
      />
    </div>
  );
};

export default AreaManagement;