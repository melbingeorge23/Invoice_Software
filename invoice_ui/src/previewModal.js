const [previewData, setPreviewData] = useState(null);
const [showPreview, setShowPreview] = useState(false);

const PreviewModal = ({ data, onClose, onDownload }) => {
  if (!data) return null;

  return (
    <div className="preview-modal">
      <div className="preview-content">
        <div className="preview-header">
          <h3>Invoice Preview</h3>
          <button onClick={onClose} className="btn-close">
            &times;
          </button>
        </div>
        <div className="preview-body">
          {/* Render your preview here */}
          <p>Reference: {data.refNo}</p>
          <p>Date: {data.date}</p>
          <p>To: {data.toAddress}</p>
          
          <table className="preview-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>HSN</th>
                <th>GST %</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{item.hsnCode}</td>
                  <td>{item.gstRate}%</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.unitPrice.toFixed(2)}</td>
                  <td>₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="preview-totals">
            <p>Net Total: ₹{data.netTotal.toFixed(2)}</p>
            <p>GST: ₹{data.gst.toFixed(2)}</p>
            <p>Grand Total: ₹{data.grandTotal.toFixed(2)}</p>
          </div>
        </div>
        <div className="preview-footer">
          <button 
            onClick={() => onDownload('pdf')} 
            className="btn-download"
          >
            Download PDF
          </button>
          <button 
            onClick={() => onDownload('word')} 
            className="btn-download"
          >
            Download Word
          </button>
        </div>
      </div>
    </div>
  );
};