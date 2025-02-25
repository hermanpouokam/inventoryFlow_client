import { instance } from "@/components/fetch";

const check_warnings = async ({ supplyId }: { supplyId: number }) => {
  try {
    const res = await instance.get(`supplies/${supplyId}/check_warnings`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {}
};

const receiptSupply = async ({ supplyId }: { supplyId: number }) => {
  try {
    const res = await instance.put(
      `supplies/${supplyId}/update-status/`,
      {
        status: "receipt",
      },
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {}
};

export { check_warnings, receiptSupply };
