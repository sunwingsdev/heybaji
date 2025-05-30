import ReasonModal from "../../components/dashboard/ReasonModal";
import { IoIosSearch } from "react-icons/io";
import { useState, useEffect } from "react";
import { useToasts } from "react-toast-notifications";

// New Withdraw Details Modal Component
const WithdrawDetailsModal = ({ isOpen, onClose, withdraw }) => {
  if (!isOpen || !withdraw) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white px-4 py-6 md:p-6 rounded-lg shadow-lg w-[90%] md:w-[80%] lg:w-[60%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Withdrawal Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* User Details */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-2">
            User Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <p>
              <strong>Username:</strong>{" "}
              {withdraw.userInfo?.username || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {withdraw.userInfo?.phone || "N/A"}
            </p>
            {withdraw.userInfo?.email && (
              <p>
                <strong>Email:</strong> {withdraw.userInfo.email}
              </p>
            )}
          </div>
        </div>

        {/* Payment Inputs */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-2">
            Payment Inputs
          </h3>
          {withdraw.paymentInputs?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {withdraw.paymentInputs.map((input, index) => (
                <p key={index}>
                  <strong>{Object.keys(input)[0]}:</strong>{" "}
                  {Object.values(input)[0]}
                </p>
              ))}
            </div>
          ) : (
            <p>No payment inputs provided.</p>
          )}
        </div>

        {/* Payment Details */}
        <div>
          <h3 className="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-2">
            Payment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <p>
              <strong>Amount:</strong> {withdraw.amount || "N/A"}
            </p>
            <p>
              <strong>Payment Method:</strong>{" "}
              {withdraw.paymentMethod || "N/A"}
            </p>
            <p>
              <strong>Deposit Channel:</strong>{" "}
              {withdraw.depositChannel || "N/A"}
            </p>
            <p>
              <strong>Gateway:</strong> {withdraw.gateway || "N/A"}
            </p>
            <p>
              <strong>Receiver Type:</strong>{" "}
              {withdraw.receiverType || "N/A"}
            </p>
            <p>
              <strong>Receiver A/C Number:</strong>{" "}
              {withdraw.accountNumber || withdraw.receiverNumber || "N/A"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`capitalize ${
                  withdraw.status === "approved"
                    ? "text-green-500"
                    : withdraw.status === "rejected"
                    ? "text-red-500"
                    : "text-yellow-500"
                }`}
              >
                {withdraw.status}
              </span>
            </p>
            {withdraw.reason && (
              <p>
                <strong>Reason:</strong> {withdraw.reason}
              </p>
            )}
            <p>
              <strong>Created At:</strong>{" "}
              {withdraw.createdAt
                ? new Date(withdraw.createdAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const WithdrawHistory = () => {
  const [allWithdraws, setAllWithdraws] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedWithdraw, setSelectedWithdraw] = useState(null);
  const { addToast } = useToasts();

  // Fetch all withdrawals on component mount
  useEffect(() => {
    const fetchWithdraws = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/withdraws`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        const result = await response.json();
        if (response.ok) {
          setAllWithdraws(result || []);
        } else {
          throw new Error(result.message || "Failed to fetch withdrawals");
        }
      } catch (error) {
        setIsError(true);
        addToast(error.message || "Error loading withdrawals", {
          appearance: "error",
          autoDismiss: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchWithdraws();
  }, []);

  const handleAccept = async (withdraw) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/withdraws/${withdraw._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to approve withdrawal");
      }

      // Update local state
      setAllWithdraws((prev) =>
        prev.map((w) =>
          w._id === withdraw._id ? { ...w, status: "approved" } : w
        )
      );
      addToast("Withdrawal approved successfully!", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      addToast(error.message || "Error approving withdrawal", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleReject = (withdraw) => {
    setSelectedWithdraw(withdraw);
    setModalOpen(true);
  };

  const handleDelete = async (withdraw) => {
    if (!confirm("Are you sure you want to delete this withdrawal?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/withdraws/${withdraw._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete withdrawal");
      }

      // Update local state
      setAllWithdraws((prev) => prev.filter((w) => w._id !== withdraw._id));
      addToast("Withdrawal deleted and balance refunded!", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      addToast(error.message || "Error deleting withdrawal", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleSubmit = async (reason) => {
    if (!reason) {
      addToast("Please provide a reason for rejection", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/withdraws/${selectedWithdraw._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "rejected",
            reason: reason,
          }),
        }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to reject withdrawal");
      }

      // Update local state
      setAllWithdraws((prev) =>
        prev.map((w) =>
          w._id === selectedWithdraw._id
            ? { ...w, status: "rejected", reason }
            : w
        )
      );
      addToast("Withdrawal rejected and balance refunded!", {
        appearance: "success",
        autoDismiss: true,
      });
      setModalOpen(false);
    } catch (error) {
      addToast(error.message || "Error rejecting withdrawal", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedWithdraw(null);
  };

  const handleDetails = (withdraw) => {
    setSelectedWithdraw(withdraw);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedWithdraw(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading withdrawals.</div>;

  return (
    <div>
      <div className="bg-[#172437] flex flex-row items-center justify-between p-4 mb-2">
        <h1 className="text-2xl text-white font-bold">Withdraw History</h1>
        <form className="w-1/2 md:w-1/4 flex flex-row items-center">
          <input
            type="text"
            placeholder="Type Name or Receiver A/C Number..."
            className="py-2 px-1 w-full outline-none"
          />
          <button className="bg-white p-3">
            <IoIosSearch />
          </button>
        </form>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-[#172437] dark:bg-[#172437] dark:text-gray-400">
            <tr>
              <th scope="col" className="px-3 py-3">
                Username
              </th>
              <th scope="col" className="px-3 py-3">
                Phone
              </th>
              <th scope="col" className="px-3 py-3">
                Withdraw Gateway
              </th>
             
              <th scope="col" className="px-3 py-3">
                Withdraw Method
              </th>
            
              <th scope="col" className="px-3 py-3">
                Amount
              </th>
              <th scope="col" className="px-3 py-3">
                Time & Date
              </th>
              <th scope="col" className="px-3 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {allWithdraws?.map((withdraw, index) => (
              <tr
                key={withdraw._id}
                className={`${
                  index % 2 === 0 ? "bg-gray-100" : "bg-gray-200"
                } text-black`}
              >
                <td className="px-2 py-2">
                  {withdraw.userInfo?.username || "N/A"}
                </td>
                <td className="px-2 py-2">
                  {withdraw.userInfo?.phone || "N/A"}
                </td>
                <td className="px-2 py-2">{withdraw.depositChannel || "N/A"}</td>
             
                <td className="px-2 py-2">{withdraw.paymentMethod || "N/A"}</td>
               
                <td className="px-2 py-2">{withdraw.amount}</td>
                <td className="px-2 py-2">
                  {withdraw.createdAt
                    ? new Date(withdraw.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "N/A"}
                </td>
                <td className="px-2 py-2 text-center">
                  <div className="flex flex-col gap-2">
                    {withdraw.status === "pending" ? (
                      <>
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                          onClick={() => handleAccept(withdraw)}
                        >
                          Accept
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                          onClick={() => handleReject(withdraw)}
                        >
                          Reject
                        </button>
                        <button
                          className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600"
                          onClick={() => handleDelete(withdraw)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span
                        className={`rounded-full px-3 py-1 text-white capitalize ${
                          withdraw.status === "approved"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        {withdraw.status}
                      </span>
                    )}
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                      onClick={() => handleDetails(withdraw)}
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {allWithdraws?.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">
                  No withdrawals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Reason Modal */}
      <ReasonModal
yczny isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        status="rejected"
      />
      {/* Details Modal */}
      <WithdrawDetailsModal
        isOpen={detailsModalOpen}
        onClose={handleCloseDetailsModal}
        withdraw={selectedWithdraw}
      />
    </div>
  );
};

export default WithdrawHistory;