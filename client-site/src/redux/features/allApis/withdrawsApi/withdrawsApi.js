// import baseApi from "../../baseApi";

// const withdrawsApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     // add a withdraw
//     addWithdraw: builder.mutation({
//       query: (data) => ({
//         url: "/withdraws",
//         method: "POST",
//         body: data,
//       }),
//       invalidatesTags: ["withdraws"],
//     }),

//     // get all withdraws
//     getWithdraws: builder.query({
//       query: () => "/withdraws",
//       providesTags: ["withdraws"],
//     }),

//     // update status
//     updateWithdrawStatus: builder.mutation({
//       query: ({ id, data }) => ({
//         url: `/withdraws/status/${id}`,
//         method: "PATCH",
//         body: data,
//       }),
//       invalidatesTags: ["withdraws"],
//     }),
//   }),
// });

// export const {
//   useAddWithdrawMutation,
//   useGetWithdrawsQuery,
//   useUpdateWithdrawStatusMutation,
// } = withdrawsApi;



import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const withdrawsApi = createApi({
  reducerPath: "withdrawsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BASE_API_URL}/withdraws`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    addWithdraw: builder.mutation({
      query: (withdrawData) => ({
        url: "/",
        method: "POST",
        body: withdrawData,
      }),
    }),

    // get all withdraws
    getWithdraws: builder.query({
      query: () => "/withdraws",
      providesTags: ["withdraws"],
    }),

        // update status
    updateWithdrawStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/withdraws/status/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["withdraws"],
    }),

  }),
});

export const { useAddWithdrawMutation ,useGetWithdrawsQuery ,  useUpdateWithdrawStatusMutation} = withdrawsApi;