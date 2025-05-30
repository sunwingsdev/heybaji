import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import AddWithdrawMethodForm from "./AddWithdrawMethodForm";
import { AiOutlineDelete, AiOutlineRollback } from "react-icons/ai";
import { IoReloadOutline } from "react-icons/io5";
import DeleteModal from "../../components/shared/modal/DeleteModal";
import { useToasts } from "react-toast-notifications";
import { deleteImage } from "../../hooks/files";

const WithdrawsMethod = () => {
  const [gateways, setGateways] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [item, setItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addNewMethod, setAddNewMethod] = useState(false);
  const { addToast } = useToasts();

  const baseURL = import.meta.env.VITE_BASE_API_URL;

  // Fetch payment methods
  useEffect(() => {
    const fetchGateways = async () => {
      try {
        const response = await fetch(`${baseURL}/paymentmethod`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (response.ok) {
          setGateways(data);
        } else {
          addToast("Failed to fetch payment methods.", {
            appearance: "error",
            autoDismiss: true,
          });
        }
      } catch (error) {
        addToast("Error fetching payment methods.", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    };
    fetchGateways();
  }, [baseURL, addToast , addNewMethod]);

  // Filter gateways for withdraw type
  const filteredGateways = gateways?.filter(
    (gateway) => gateway.paymentType === "withdraw"
  );

  // Search functionality
  const searchedGateways = filteredGateways?.filter((gateway) =>
    gateway.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open delete modal
  const handleOpenModal = (item) => {
    setIsOpen(true);
    setItem(item);
  };

  // Delete payment method
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const { message } = await deleteImage(item?.image);
      if (message) {
        const response = await fetch(`${baseURL}/paymentmethod/${item?._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (response.ok && data.deletedCount > 0) {
          setGateways(gateways.filter((gateway) => gateway._id !== item._id));
          addToast("Payment method deleted successfully.", {
            appearance: "success",
            autoDismiss: true,
          });
          setIsOpen(false);
        } else {
          addToast("Failed to delete the payment method.", {
            appearance: "error",
            autoDismiss: true,
          });
        }
      } else {
        addToast("Image not deleted.", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    } catch (error) {
      addToast("Error deleting payment method.", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update status
  const handleUpdateStatus = async (gateway) => {
    const newStatus = gateway.status === "active" ? "deactive" : "active";
    try {
      const response = await fetch(`${baseURL}/paymentmethod/${gateway._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (response.ok && data.modifiedCount > 0) {
        setGateways(
          gateways.map((g) =>
            g._id === gateway._id ? { ...g, status: newStatus } : g
          )
        );
        addToast("Status updated successfully.", {
          appearance: "success",
          autoDismiss: true,
        });
      } else {
        addToast("Failed to update status.", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    } catch (error) {
      addToast("Error updating status.", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  return (
    <>
      {!addNewMethod ? (
        <section className="bg-[#F3F3F9] p-6">
          <div className="w-full bg-white p-4">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
              Manual Withdraw Gateways
            </h1>
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-1/2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={() => setAddNewMethod(true)}
                className="bg-SidebarBg hover:bg-hoverSidebarBg text-white px-4 py-2 rounded-[3px] focus:outline-none"
              >
                + Add New
              </button>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-SidebarBg text-white">
                  <th className="py-3 px-4 text-left">Gateway</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {searchedGateways?.map((gateway) => (
                  <tr
                    key={gateway._id}
                    className="border-b border-x border-slate-500"
                  >
                    <td className="py-1 px-4">
                      <img
                        className="size-12 inline-flex items-center gap-2"
                        src={`${baseURL}${gateway?.image}`}
                        alt=""
                      />
                      <span className="ps-2">{gateway.method}</span>
                    </td>
                    <td className="py-1 px-4">
                      <div
                        onClick={() => handleUpdateStatus(gateway)}
                        className="flex items-center hover:cursor-pointer"
                      >
                        <span
                          className={`h-2 w-2 ${
                            gateway?.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          } rounded-full mr-2`}
                        />
                        <span
                          className={` ${
                            gateway?.status === "active"
                              ? "text-green-700"
                              : "text-red-700"
                          } text-sm capitalize`}
                        >
                          {gateway.status || ""}
                        </span>
                      </div>
                    </td>
                    <td className="py-1 px-4 mx-auto">
                      <div className="flex items-center justify-center">
                        {isLoading ? (
                          <IoReloadOutline className="animate-spin" />
                        ) : (
                          <AiOutlineDelete
                            onClick={() => handleOpenModal(gateway)}
                            className="text-3xl text-red-600 hover:text-red-800 hover:cursor-pointer"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="p-6">
          <button
            onClick={() => setAddNewMethod(false)}
            className="flex items-center text-gray-500 hover:text-blue-600 hover:underline focus:outline-none"
          >
            <AiOutlineRollback className="mr-1" /> Back
          </button>
          <AddWithdrawMethodForm setAddNewMethod={setAddNewMethod} />
        </section>
      )}

      <DeleteModal
        closeModal={() => setIsOpen(false)}
        isOpen={isOpen}
        handleDelete={handleDelete}
      />
    </>
  );
};

export default WithdrawsMethod;