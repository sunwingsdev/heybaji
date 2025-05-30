
import { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserFriends,
  FaUserCheck,
  FaShieldAlt,
  FaGamepad,
  FaPlay,
  FaStop,
  FaRobot,
  FaMoneyCheck,
  FaMoneyCheckAlt,
  FaMoneyBill,
  FaMoneyBillWave,
  FaClock,
  FaHourglass,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useGetUsersQuery } from "../../redux/features/allApis/usersApi/usersApi";
import CustomTable from "../../components/dashboard/CustomTable";

// StatCard কম্পোনেন্ট
const StatCard = ({ title, value, icon, themeColor, onClick }) => (
  <div
    onClick={onClick}
    className="col-span-1 md:col-span-1 p-2 flex justify-center"
  >
    <div
      style={{
        backgroundImage: `linear-gradient(to right, #333, ${themeColor})`,
      }}
      className="relative w-full max-w-[300px] min-h-[120px] flex flex-row justify-between items-center p-4 rounded-lg shadow-md transition-transform duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg border border-gray-200 cursor-pointer"
    >
      <div className="flex flex-col justify-center">
        {value === "Loading..." || value === undefined ? (
          <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin mb-2"></div>
        ) : (
          <div className="text-lg md:text-xl font-bold text-white">{value}</div>
        )}
        <div className="text-xs md:text-sm font-medium text-yellow-300 uppercase tracking-wide">
          {title.length > 20 ? `${title.slice(0, 17)}...` : title}
        </div>
      </div>
      <div className="text-2xl md:text-3xl text-white">{icon}</div>
    </div>
  </div>
);

const DashboardHome = () => {
  const navigate = useNavigate();
  const { data: users, isLoading } = useGetUsersQuery();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: "Loading...",
    totalAffiliator: "Loading...",
    totalWalletAgent: "Loading...",
    totalWhiteLabel: "Loading...",
    totalGames: "Loading...",
    activeGame: "Loading...",
    inactiveGame: "Loading...",
    totalGameApi: "Loading...",
    totalDeposit: "Loading...",
    todayDeposit: "Loading...",
    totalWithdraw: "Loading...",
    todayWithdraw: "Loading...",
    pendingDepositRequests: "Loading...",
    pendingWithdrawRequests: "Loading...",
  });

  const baseURL = import.meta.env.VITE_BASE_API_URL;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${baseURL}/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const { data } = await response.json();
        console.log("API Response:", data); // ডিবাগিংয়ের জন্য API রেসপন্স লগ
        console.log("Users Length:", users?.length); // ডিবাগিংয়ের জন্য users লেন্থ লগ
        setDashboardData({
          totalUsers: data.totalUsers ?? users?.length ?? 0,
          totalAffiliator: data.totalAffiliator ?? 0,
          totalWalletAgent: data.totalWalletAgent ?? 0,
          totalWhiteLabel: data.totalWhiteLabel ?? 0,
          totalGames: data.totalGames ?? 0,
          activeGame: data.activeGame ?? 0,
          inactiveGame: data.inactiveGame ?? 0,
          totalGameApi: data.totalGameApi ?? 0,
          totalDeposit: data.totalDeposit?.toFixed(2) ?? "0.00",
          todayDeposit: data.todayDeposit?.toFixed(2) ?? "0.00",
          totalWithdraw: data.totalWithdraw?.toFixed(2) ?? "0.00",
          todayWithdraw: data.todayWithdraw?.toFixed(2) ?? "0.00",
          pendingDepositRequests: data.pendingDepositRequests ?? 0,
          pendingWithdrawRequests: data.pendingWithdrawRequests ?? 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setDashboardData({
          totalUsers: users?.length ?? 0,
          totalAffiliator: 0,
          totalWalletAgent: 0,
          totalWhiteLabel: 0,
          totalGames: 0,
          activeGame: 0,
          inactiveGame: 0,
          totalGameApi: 0,
          totalDeposit: "0.00",
          todayDeposit: "0.00",
          totalWithdraw: "0.00",
          todayWithdraw: "0.00",
          pendingDepositRequests: 0,
          pendingWithdrawRequests: 0,
        });
      }
    };

    if (!isLoading) {
      fetchDashboardData();
    }
  }, [isLoading, users]);

  // স্ট্যাট ডেটা ক্যাটাগরি অনুযায়ী গ্রুপ করা
  const statsDataForUserRow = [
    {
      title: "Total User",
      value: dashboardData.totalUsers,
      icon: <FaUsers />,
      route: "/dashboard/all-user",
      themeColor: "#b81e2d",
    },
    {
      title: "Total Affiliator",
      value: dashboardData.totalAffiliator,
      icon: <FaUserFriends />,
      route: "/",
      themeColor: "#b81e2d",
    },
    {
      title: "Total Wallet Agent",
      value: dashboardData.totalWalletAgent,
      icon: <FaUserCheck />,
      route: "/",
      themeColor: "#b81e2d",
    },
    {
      title: "Total White Label",
      value: dashboardData.totalWhiteLabel,
      icon: <FaShieldAlt />,
      route: "/",
      themeColor: "#b81e2d",
    },
  ];

  const statsDataForGameRow = [
    {
      title: "Total Game",
      value: dashboardData.totalGames,
      icon: <FaGamepad />,
      route: "/dashboard/game-categories",
      themeColor: "#45f82a",
    },
    {
      title: "Active Game",
      value: dashboardData.activeGame,
      icon: <FaPlay />,
      route: "/dashboard/active-games",
      themeColor: "#45f82a",
    },
    {
      title: "Inactive Game",
      value: dashboardData.inactiveGame,
      icon: <FaStop />,
      route: "/",
      themeColor: "#45f82a",
    },
    {
      title: "Total Game API",
      value: dashboardData.totalGameApi,
      icon: <FaRobot />,
      route: "/",
      themeColor: "#45f82a",
    },
  ];

  const statsDataForMoneyRow = [
    {
      title: "Total Deposit",
      value: dashboardData.totalDeposit,
      icon: <FaMoneyCheck />,
      route: "/dashboard/DepositHistory",
      themeColor: "#010fe5",
    },
    {
      title: "Today Deposit",
      value: dashboardData.todayDeposit,
      icon: <FaMoneyCheckAlt />,
      route: "/dashboard/DepositHistory",
      themeColor: "#010fe5",
    },
    {
      title: "Total Withdraw",
      value: dashboardData.totalWithdraw,
      icon: <FaMoneyBill />,
      route: "/dashboard/WithdrawalHistory",
      themeColor: "#010fe5",
    },
    {
      title: "Today Withdraw",
      value: dashboardData.todayWithdraw,
      icon: <FaMoneyBillWave />,
      route: "/dashboard/WithdrawalHistory",
      themeColor: "#010fe5",
    },
  ];

  const statsDataForPendingRequestsRow = [
    {
      title: "Pending Deposit Requests",
      value: dashboardData.pendingDepositRequests,
      icon: <FaClock />,
      route: "/dashboard/DepositHistory",
      themeColor: "#e91e63",
    },
    {
      title: "Pending Withdraw Requests",
      value: dashboardData.pendingWithdrawRequests,
      icon: <FaHourglass />,
      route: "/dashboard/WithdrawalHistory",
      themeColor: "#e91e63",
    },
  ];

  const handleCardClick = (route) => {
    navigate(route);
  };

  // টেবিল ডেটা (প্রথম কোড থেকে)
  const userPaymentsHeaders = ["Cashier", "Money In", "Money Out", "Date"];
  const userPaymentsData = [
    {
      cashier: "TestCash",
      moneyIn: "10.000",
      moneyOut: "0.000",
      date: "07:39:59",
    },
  ];

  const userGamesHeaders = ["Game", "User", "Balance", "Bet", "Win", "Date"];
  const userGamesData = [
    {
      game: "AlchemistsSecretGT",
      user: "435893412",
      balance: "6.5000",
      bet: "0.4000",
      win: "0.0000",
      date: "23:32:03",
    },
    {
      game: "AlchemistsSecretGT",
      user: "435893412",
      balance: "6.9000",
      bet: "0.4000",
      win: "0.0000",
      date: "23:31:20",
    },
  ];

  const latestShopsHeaders = [
    "Name",
    "Credit",
    "Percent",
    "Frontend",
    "Currency",
    "Status",
  ];
  const latestShopsData = [
    {
      Name: "TestShop",
      Credit: "9990.0000",
      Percent: "90 - 92",
      Frontend: "Default",
      Currency: "USD",
      Status: "Active",
    },
  ];

  const latestShiftStatsHeader = [
    "Shift",
    "User",
    "Start",
    "End",
    "Credit",
    "In",
    "-",
    "Total",
    "Money",
    "In",
    "-",
    "Total",
    "Transfers",
    "Pay Out",
  ];
  const latestShiftStatsData = [
    {
      Shift: "10",
      User: "TestCash",
      Start: "2024-10-15 07:39:59",
      End: "0",
      Credit: "0",
      In: "0",
      "-": "10",
      Total: "9999",
      Money: "6.5000",
      In2: "10000",
      _: "0.000",
      Total2: "10000",
      Transfers: "1",
      Pay_Out: "000",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* User Statistics */}
      <div className="my-3 border-4 border-dotted border-red-500 rounded-lg p-4">
        <h2 className="text-lg font-bold text-black mb-4">User Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsDataForUserRow.map((stat, index) => (
            <StatCard
              key={index}
              themeColor={stat.themeColor}
              title={stat.title}
              value={isLoading ? "Loading..." : stat.value}
              icon={stat.icon}
              onClick={() => handleCardClick(stat.route)}
            />
          ))}
        </div>
      </div>

      {/* Game Statistics */}
      <div className="my-3 border-4 border-dotted border-red-500 rounded-lg p-4">
        <h2 className="text-lg font-bold text-black mb-4">Game Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsDataForGameRow.map((stat, index) => (
            <StatCard
              key={index}
              themeColor={stat.themeColor}
              title={stat.title}
              value={isLoading ? "Loading..." : stat.value}
              icon={stat.icon}
              onClick={() => handleCardClick(stat.route)}
            />
          ))}
        </div>
      </div>

      {/* Money Statistics */}
      <div className="my-3 border-4 border-dotted border-red-500 rounded-lg p-4">
        <h2 className="text-lg font-bold text-black mb-4">Money Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsDataForMoneyRow.map((stat, index) => (
            <StatCard
              key={index}
              themeColor={stat.themeColor}
              title={stat.title}
              value={isLoading ? "Loading..." : stat.value}
              icon={stat.icon}
              onClick={() => handleCardClick(stat.route)}
            />
          ))}
        </div>
      </div>

      {/* Pending Requests */}
      <div className="my-3 border-4 border-dotted border-red-500 rounded-lg p-4">
        <h2 className="text-lg font-bold text-black mb-4">Pending Requests</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsDataForPendingRequestsRow.map((stat, index) => (
            <StatCard
              key={index}
              themeColor={stat.themeColor}
              title={stat.title}
              value={isLoading ? "Loading..." : stat.value}
              icon={stat.icon}
              onClick={() => handleCardClick(stat.route)}
            />
          ))}
        </div>
      </div>

      {/* Tables */}
      <CustomTable
        title="User Payments"
        headers={userPaymentsHeaders}
        data={userPaymentsData}
        borderColor="#30b779"
      />
      <CustomTable
        title="User Games"
        headers={userGamesHeaders}
        data={userGamesData}
        borderColor="#f39c12"
      />
      <CustomTable
        title="Latest Shops"
        headers={latestShopsHeaders}
        data={latestShopsData}
        borderColor="#30b779"
      />
      <CustomTable
        title="Latest Shift Stats"
        headers={latestShiftStatsHeader}
        data={latestShiftStatsData}
        borderColor="#f39c12"
      />
    </div>
  );
};

export default DashboardHome;
