
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const WithdrawLastPage = ({
  paymentMethod,
  closeModal,
  handleInputChange,
  formData,
  handleSubmit,
  isLoading,
  tempInputValues,
}) => {
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToasts();

  const validateRequiredFields = () => {
    const requiredFields = paymentMethod?.userInputs?.filter(
      (input) => input.isRequired === "required"
    );

    for (const field of requiredFields) {
      if (!tempInputValues[field.name]) {
        addToast(`Please fill in the required field: ${field.label}`, {
          appearance: "error",
          autoDismiss: true,
        });
        return false;
      }
    }

    // Check if balance is sufficient
    if (formData.amount > user?.balance) {
      addToast("Insufficient balance for withdrawal", {
        appearance: "error",
        autoDismiss: true,
      });
      return false;
    }

    return true;
  };

  const handleFormSubmit = () => {
    if (validateRequiredFields()) {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white px-4 py-6 md:p-6 rounded-lg shadow-lg w-[90%] md:w-[80%] lg:w-[60%] xl:w-[54%] relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-2 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex gap-2 items-center pb-4 text-xl font-bold border-b-2 border-gray-300">
          <img
            className="w-12"
            src={`${import.meta.env.VITE_BASE_API_URL}${paymentMethod.image}`}
            alt=""
          />
          <p>
            <span className="uppercase">{paymentMethod.method}</span> Withdrawal
          </p>
        </div>

        {/* Instructions */}
        <div className="text-base text-gray-500 text-center m-auto w-full lg:w-[80%]">
          <p className="mt-4">
            Please ensure the withdrawal amount and details are correct. We are not
            liable for incorrect information.
          </p>
          <p>Only use your registered phone number for withdrawal.</p>
        </div>

        {/* Form */}
        <div className="w-full xl:w-[86%] m-auto mt-5 flex justify-evenly items-center flex-col gap-3 p-4 pb-6 bg-gray-200 rounded-xl">
          <div className="w-full xl:w-[50%]">
            <p className="text-lg text-center">
              Amount:{" "}
              <span className="text-red-500 font-bold">
                {formData?.amount || 0}
              </span>
            </p>
            <div className="">
              {paymentMethod?.userInputs?.map((item) => (
                <div key={item?.name}>
                  <label className="text-red-500 mt-3">{item?.label}</label>
                  {item?.type === "file" ? (
                    <input
                      name={item?.name}
                      type="file"
                      className="w-full py-1.5 px-3 outline-none rounded-sm"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        handleInputChange(item?.name, file);
                      }}
                      required={item?.isRequired === "required"}
                    />
                  ) : (
                    <input
                      name={item?.name}
                      type={item?.type}
                      className="w-full text-sm py-1.5 px-3 outline-none rounded-sm"
                      placeholder={item.label}
                      value={tempInputValues[item?.name] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange(item?.name, value);
                      }}
                      required={item?.isRequired === "required"}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="w-full sm:w-60 mx-auto">
              <button
                type="submit"
                onClick={handleFormSubmit}
                disabled={isLoading}
                className="mt-6 w-full p-2 text-base font-semibold bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawLastPage;