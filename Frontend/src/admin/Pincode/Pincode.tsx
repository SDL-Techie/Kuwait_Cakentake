import React, { useState, useEffect } from 'react';
import { pincodeApi } from '../../services/directApiService';
import { MapPin, IndianRupee, Search, Trash2, Loader2, Plus, MapPinned, X } from 'lucide-react';
import './Pincode.css';
import toast from 'react-hot-toast';


const Pincode = () => {
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    pincode: '',
    deliveryCharge: '',
    status: 'Active'
  });

  const fetchPincodes = async () => {
    try {
      setLoading(true);
      const res = await pincodeApi.list();;
      setPincodes(res.data);
    } catch (err) {
      console.error("Error fetching pincodes", err);
      toast.error("Error fetching pincodes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPincodes();
  }, []);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await pincodeApi.create( {
      pincode: formData.pincode,
      delivery_charge: Number(formData.deliveryCharge), // ✅ FIX
    });

    toast.success("Saved Successfully.");
    setFormData({ pincode: '', deliveryCharge: '', status: 'Active' });
    fetchPincodes();
  } catch (err) {
    toast.error("Error saving pincode");
  }
};

  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedId, setSelectedId] = useState<number | null>(null);

//   const handleDelete = async () => {
//   if (!selectedId) return;

//   try {
//     await axios.delete(
//     );

//     toast.success("Deleted successfully");
//     fetchPincodes();
//   } catch (err) {
//     toast.error("Delete failed");
//   }
// };
 

const handleDelete = async () => {
  if (!selectedId) return;

  try {
    setDeleting(selectedId);

    await pincodeApi.remove(selectedId);

    toast.success("Deleted successfully");

    setShowDeleteModal(false);
    setSelectedId(null);

    fetchPincodes();
  } catch (err) {
    toast.error("Delete failed");
  } finally {
    setDeleting(null);
  }
};

const filteredPincodes = pincodes.filter(p => 
    p.pincode.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="admin-loading-state">
        <Loader2 className="spinner" size={40} />
        <p>Loading delivery zones...</p>
      </div>
    );
  }

  return (
    <div className="rasi-pincode-container">
      {/* Header */}
      <div className="rasi-pincode-header">
        <div className="header-info">
          <h1>Pincode Management</h1>
          <span className="user-count-badge">{pincodes.length} Delivery Zones</span>
        </div>
        
        <div className="rasi-search-box">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search pincode..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Add New Pincode Section (Card Style) */}
      <div className="rasi-table-card form-card">
        <form onSubmit={handleSubmit} className="pincode-form">
          <div className="form-row">
            <div className="form-group">
              <label className="id-text">PINCODE</label>
              <div className="rasi-search-box">
                {/* <MapPin className="search-icon" size={16} /> */}
                <input 
                  type="text" 
                  placeholder="614201" 
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="id-text">DELIVERY CHARGE (₹)</label>
              <div className="rasi-search-box">
                {/* <IndianRupee className="search-icon" size={16} /> */}
                <input 
                  type="number" 
                  placeholder="200" 
                  required
                  value={formData.deliveryCharge}
                  onChange={(e) => setFormData({...formData, deliveryCharge: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="role-tag admin submit-btn"
            >
              <Plus size={18} /> <span className="btn-text">Add Zone</span>
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="rasi-table-card">
        <div className="table-scroll">
          <table className="rasi-users-table">
            <thead>
              <tr>
                <th className="col-zone">Zone Details</th>
                <th className="col-pincode">Pincode</th>
                <th className="col-charge">Charge</th>
                <th className="col-status">Status</th>
                <th className="col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPincodes.length > 0 ? filteredPincodes.map((item) => (
                <tr key={item.id}>
                  <td data-label="Zone Details" className="col-zone">
                    <div className="name-cell">
                      <span className="bold-name">Zone {item.pincode.substring(0,3)}</span>
                    </div>
                  </td>
                  <td data-label="Pincode" className="col-pincode">
                    <span className="id-text pincode-text">{item.pincode}</span>
                  </td>
                  <td data-label="Charge" className="col-charge">
                     <div className="contact-item">
                       <IndianRupee size={14} />
                       <span className="charge-value">{item.delivery_charge}</span>
                     </div>
                  </td>
                  <td data-label="Status" className="col-status">
                    <span className={`role-tag ${item.status === 'Active' ? 'customer' : 'admin'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td data-label="Action" className="col-action">
                    <button 
                      className="delete-btn" 
                      // onClick={() => handleDelete(item._id)}
                      onClick={() => {
  setSelectedId(item.id);
  setShowDeleteModal(true);
}}
                      disabled={deleting === item.id}
                      title="Delete delivery zone"
                    >
                      {deleting === item.id ? (
                        <Loader2 size={16} className="spinner-small" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="no-data">No delivery zones found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
      </div>
  {showDeleteModal && (
  <div className="delete-modal-overlay">
    <div className="delete-modal">
      <div className="modal-header">
        {/* <Trash2 size={28} /> */}
        <h3>Delete Delivery Zone</h3>
      </div>

      <p>
        Are you sure you want to delete this delivery zone?
      </p>

      <div className="modal-actions">
        <button
          className="cancel-btn"
          onClick={() => {
            setShowDeleteModal(false);
            setSelectedId(null);
          }}
        >
          Cancel
        </button>

      <button
  className="confirm-delete-btn"
  onClick={handleDelete}
>
  Delete
</button>
      </div>
    </div>
  </div>
)}    
      
    </div>
    
  );
};

export default Pincode;