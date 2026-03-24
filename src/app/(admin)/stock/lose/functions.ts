import { instance } from "@/components/fetch";

interface DataCreate {
  product: number;
  variant?: number;
  salespoint: number;
  quantity: number;
  reason: string;
}

const createLoss = async (data: DataCreate) => {
  try {
    const response = await instance.post("/loss/create/", data);

    console.log("Perte créée avec succès:", response.data);
    return response;
  } catch (error) {
    console.error(
      "Erreur lors de la création de la perte:",
      error.response?.data
    );
    throw error;
  }
};

const validateLoss = async (lossId: number) => {
  try {
    const response = await instance.put(`/loss/validate/${lossId}/`);

    console.log("Perte validée avec succès:", response.data);
    return response;
  } catch (error) {
    console.error(
      "Erreur lors de la validation de la perte:",
      error.response?.data
    );
    throw error;
  }
};

const deleteLoss = async (lossId: number) => {
  try {
    const response = await instance.delete(`/loss/delete/${lossId}/`);
    console.log("Perte supprimée avec succès:", response.data);
    return response;
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de la perte:",
      error.response?.data
    );
    throw error;
  }
};

export { createLoss, validateLoss, deleteLoss };
