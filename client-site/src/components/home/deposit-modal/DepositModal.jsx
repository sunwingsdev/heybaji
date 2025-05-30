import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useGetPromotionsQuery } from "../../../redux/features/allApis/promotionApi/promotionApi";
import { useGetPaymentMethodsQuery } from "../../../redux/features/allApis/paymentMethodApi/paymentMethodApi";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { Check } from "lucide-react";
import { BsFillPatchExclamationFill } from "react-icons/bs";
import { useToasts } from "react-toast-notifications";
import DepositLastPage from "./DepositLastPage";
import WithdrawLastPage from "./WithdrawLastPage"; // New component
import { useGetRandomNumberQuery } from "../../../redux/features/allApis/paymentNumberApi/paymentNumberApi";
import { uploadImage } from "../../../hooks/files";
import { useAddDepositMutation } from "../../../redux/features/allApis/depositsApi/depositsApi";
import { useAddWithdrawMutation } from "../../../redux/features/allApis/withdrawsApi/withdrawsApi"; // New mutation
import { useSelector } from "react-redux";


const amounts = [200, 500, 1000, 5000, 10000, 15000, 20000, 25000];

const DepositModal = ({ closeDepositModal }) => {
  const { user } = useSelector((state) => state.auth);
  const [addDeposit, { isLoading: isDepositLoading }] = useAddDepositMutation();
  const [addWithdraw, { isLoading: isWithdrawLoading }] = useAddWithdrawMutation(); // New mutation
  const { data: promotions } = useGetPromotionsQuery();
  const { data: paymentMethods } = useGetPaymentMethodsQuery();
  const [tempInputValues, setTempInputValues] = useState({});
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [activeTabBottom, setActiveTabBottom] = useState("deposit");
  const [formData, setFormData] = useState({
    amount: 0,
    paymentMethod: "",
    depositChannel: "",
    bonusId: "",
    paymentInputs: [],
    userId: user?._id,
  });
  
const [depositChannels, setDepositChannels] = useState([]);


  useEffect(() => {
    setDepositChannels(
      activeTabBottom === "deposit" ? [paymentMethod?.gateway === "BANK_TRANSFER" ? "Bank Transfer" : "MOBILE BANKING"] : [paymentMethod?.gateway === "BANK_TRANSFER" ? "Bank Transfer" : "MOBILE BANKING"]
    );
  }, [activeTabBottom , formData]);


  const { data: randomNumber, refetch } = useGetRandomNumberQuery(
    formData.paymentMethod.toLowerCase(),
    { skip: !formData.paymentMethod }
  );
  const { addToast } = useToasts();

  // Filter deposit and withdrawal methods
  const depositMethods = paymentMethods?.filter(
    (method) => method?.status === "active" && method?.paymentType === "deposit"
  );
  const withdrawalMethods = paymentMethods?.filter(
    (method) => method?.status === "active" && method?.paymentType === "withdraw"
  );

  const bonusPromotions = promotions?.filter(
    (promotion) => promotion.bonus === "bonus"
  );

  // Set the first payment method based on active tab
  useEffect(() => {
    if (activeTabBottom === "deposit" && depositMethods?.length > 0 && !paymentMethod) {
      setPaymentMethod(depositMethods[0]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        paymentMethod: depositMethods[0]?.method,
      }));
    } else if (activeTabBottom === "withdrawal" && withdrawalMethods?.length > 0 && !paymentMethod) {
      setPaymentMethod(withdrawalMethods[0]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        paymentMethod: withdrawalMethods[0]?.method,
      }));
    }
  }, [depositMethods, withdrawalMethods, activeTabBottom, paymentMethod]);

  const handleClick = (amount) => {
    setFormData({
      ...formData,
      amount: parseFloat(formData.amount) + parseFloat(amount),
    });
  };

  const handleGoToNext = () => {
    if (!formData.amount) {
      addToast("Please select an amount", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    if (!formData.depositChannel) {
      addToast("Please select a deposit channel", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    if (activeTabBottom === "withdrawal" && formData.amount > user?.balance) {
      addToast("Insufficient balance for withdrawal", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    setIsFirstStep(false);
  };

  const handleInputChange = (name, value) => {
    setTempInputValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleDepositSubmit = async () => {
    const paymentInputs = [];
    for (const [name, value] of Object.entries(tempInputValues)) {
      if (value instanceof File) {
        try {
          const { filePath } = await uploadImage(value);
          paymentInputs.push({ [name]: filePath });
        } catch (error) {
          addToast("Failed to upload file. Please try again.", {
            appearance: "error",
            autoDismiss: true,
          });
          continue;
        }
      } else {
        paymentInputs.push({ [name]: value });
      }
    }
    const updatedFormData = {
      ...formData,
      paymentInputs: paymentInputs,
    };

    const result = await addDeposit(updatedFormData);

    console.log(result);
    


    if (!result.ok) {
      addToast("Failed to add deposit", {
        appearance: "error",
        autoDismiss: true,
      });
    } else if (result?.data?.insertedId) {
      addToast("Deposit added successfully", {
        appearance: "success",
        autoDismiss: true,
      });
      setFormData({
        amount: 0,
        paymentMethod: "",
        depositChannel: "",
        bonusId: "",
        paymentInputs: [],
        userId: user?._id,
      });
      closeDepositModal();
      refetch();
    }
  };

  const handleWithdrawSubmit = async () => {
    const paymentInputs = [];
    for (const [name, value] of Object.entries(tempInputValues)) {
      if (value instanceof File) {
        try {
          const { filePath } = await uploadImage(value);
          paymentInputs.push({ [name]: filePath });
        } catch (error) {
          addToast("Failed to upload file. Please try again.", {
            appearance: "error",
            autoDismiss: true,
          });
          continue;
        }
      } else {
        paymentInputs.push({ [name]: value });
      }
    }
    const updatedFormData = {
        ...formData,
        paymentInputs: paymentInputs,
      };

      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/withdraws`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });

      const result = await response.json();
    
      console.log("-->> ",result.insertedId);
      
 

      if (result.insertedId) {
      addToast("Withdrawal request submitted successfully", {
        appearance: "success",
        autoDismiss: true,
      });
      setFormData({
        amount: 0,
        paymentMethod: "",
        depositChannel: "",
        bonusId: "",
        paymentInputs: [],
        userId: user?._id,
      });
      closeDepositModal();
      refetch();
    }
 

    if ( result.error) {
      addToast( result?.error?.data?.message ||  result?.message  || "Failed to add withdrawal", {
        appearance: "error",
        autoDismiss: true,
      });
    } 
  }

  return (
    <>
      <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
        <div className="w-full max-w-md bg-SidebarBg rounded-lg shadow-md flex flex-col overflow-y-auto max-h-svh relative">
          <button
            onClick={closeDepositModal}
            className="absolute top-2 md:top-4 right-2 md:right-4 text-[#fff] text-lg hover:text-red-600 duration-300"
          >
            <FaTimes />
          </button>
          {isFirstStep ? (
            <div className="">
              <div className="flex justify-center items-center space-x-3 mt-4 px-4">
                <p className="text-2xl font-bold text-white">
                  {activeTabBottom === "deposit" ? "Deposit" : "Withdrawal"}
                </p>
              </div>
              <div className="">
                <div className="flex py-3 px-6">
                  <button
                    onClick={() => setActiveTabBottom("deposit")}
                    className={`flex-1 py-1.5 font-semibold text-center rounded-l-md ${
                      activeTabBottom === "deposit"
                        ? "text-black bg-yellow-400 loginButtonBgColor scale-105"
                        : "bg-menuHoverActiveColor text-gray-200"
                    }`}
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setActiveTabBottom("withdrawal")}
                    className={`flex-1 py-1.5 font-semibold text-center rounded-r-md ${
                      activeTabBottom === "withdrawal"
                        ? "text-black bg-yellow-400 loginButtonBgColor scale-105"
                        : "bg-menuHoverActiveColor text-gray-200"
                    }`}
                  >
                    Withdrawal
                  </button>
                </div>

                {activeTabBottom === "deposit" && (
                  <div className="bg-menuHoverActiveColor text-white text-sm flex items-center justify-between gap-2 py-2 px-5">
                    <div className="flex gap-2 items-center">
                      <img
                        src="https://img.d4040p.com/dp/h5/assets/images/icon-set/icon-selectpromotion.svg?v=1737700451320"
                        alt=""
                      />
                      <p className="whitespace-nowrap">Select Promotion</p>
                    </div>
                    <div className="flex flex-col items-start">
                      <select
                        id="bonusOption"
                        className="w-full px-2 bg-menuHoverActiveColor focus:outline-none focus:border-transparent"
                        onChange={(e) =>
                          setFormData({ ...formData, bonusId: e.target.value })
                        }
                      >
                        <option selected disabled value={""}>
                          Select an option
                        </option>
                        {bonusPromotions?.map((item) => (
                          <option key={item?._id} value={item?._id}>
                            {item?.bonusTitle}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="py-3 px-2 bg-footerBg max-h-[410px] 2xl:max-h-[560px] overflow-y-auto scrollbar-hide">
                  <div className="p-3 bg-white rounded-md">
                    <h2 className="mb-2 text-base font-semibold text-depositeModalTitleColor border-l-4 border-depositeModalBorderColor pl-1">
                      Payment Method
                    </h2>
                    <div className="grid grid-cols-3 gap-2">
                      {(activeTabBottom === "deposit" ? depositMethods : withdrawalMethods)?.map(
                        (item) => (
                          <button
                            key={item._id}
                            className="p-2 relative bg-gray-200 rounded-md text-center group"
                            onClick={() => {
                              setPaymentMethod(item);
                              setFormData({
                                ...formData,
                                paymentMethod: item?.method,
                              });
                            }}
                          >
                            <img
                              className="w-12 m-auto transform transition-transform duration-300 group-hover:scale-110"
                              src={`${import.meta.env.VITE_BASE_API_URL}${item.image}`}
                              alt={item?.method}
                            />
                            {item?.method === paymentMethod?.method && (
                              <span className="absolute top-[-5px] right-[-5px] bg-depositChannelBorderColor text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                <Check size={10} />
                              </span>
                            )}
                          </button>
                        )
                      )}
                    </div>

                    <div className="mt-2 p-3 bg-white rounded-md">
                      <h2 className="mb-2 text-base font-semibold text-depositeModalTitleColor border-l-4 border-depositeModalBorderColor pl-1">
                        {activeTabBottom === "deposit" ? "Deposit" : "Withdrawal"} Channel
                      </h2>
                      <div className="flex gap-3">
                        {depositChannels?.map((label, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                depositChannel: label,
                              })
                            }
                            className={`relative py-1.5 px-4 text-sm border rounded-sm uppercase transition-all duration-300 ${
                              formData.depositChannel === label
                                ? "border-depositChannelBorderColor text-depositChannelBorderColor"
                                : "border-gray-400 text-gray-600"
                            }`}
                          >
                            {label}
                            {formData.depositChannel === label && (
                              <span className="absolute top-[-5px] right-[-5px] bg-depositChannelBorderColor text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                <Check size={10} />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2 p-3 bg-white rounded-md">
                      <h2 className="mb-2 text-base font-semibold text-depositeModalTitleColor border-l-4 border-depositeModalBorderColor pl-1">
                        Amount
                      </h2>
                      <div>
                        <div className="grid grid-cols-4 gap-3 mb-3">
                          {amounts.map((amount, index) => (
                            <button
                              key={index}
                              onClick={() => handleClick(amount)}
                              className="flex items-center gap-2 py-1.5 px-3 text-sm border border-gray-400 rounded-sm transition-all duration-300 hover:border-black hover:text-black"
                            >
                              + {amount}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between items-center gap-2 bg-slate-200 border py-1.5 px-3 rounded-md">
                          <h3 className="text-base font-semibold">
                            <FaBangladeshiTakaSign />
                          </h3>
                          <input
                          style={{backgroundColor: 'transparent'}}
                            type="number"
                            value={formData.amount > 0 ? formData.amount : 0}
                            onChange={(e) =>
                              setFormData((prevState) => ({
                                ...prevState,
                                amount: parseFloat(e.target.value),
                              }))
                            }
                            step="any"
                            className="w-full text-right text-sm font-semibold outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2 p-2 bg-yellow-100 rounded-sm">
                        <BsFillPatchExclamationFill size={34} />
                        <div
                          dangerouslySetInnerHTML={{
                            __html: paymentMethod?.instruction,
                          }}
                          className=""
                        ></div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGoToNext}
                    className="w-full mt-2 p-1.5 text-base text-white bg-SideBarTopBg rounded-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          ) : activeTabBottom === "deposit" ? (
            <DepositLastPage
              paymentMethod={paymentMethod}
              closeModal={closeDepositModal}
              setFormData={setFormData}
              formData={formData}
              randomNumber={randomNumber}
              refetch={refetch}
              handleSubmit={handleDepositSubmit}
              handleInputChange={handleInputChange}
              tempInputValues={tempInputValues}
              isLoading={isDepositLoading}
            />
          ) : (
            <WithdrawLastPage
              paymentMethod={paymentMethod}
              closeModal={closeDepositModal}
              setFormData={setFormData}
              formData={formData}
              randomNumber={randomNumber}
              refetch={refetch}
              handleSubmit={handleWithdrawSubmit}
              handleInputChange={handleInputChange}
              tempInputValues={tempInputValues}
              isLoading={isWithdrawLoading}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default DepositModal;