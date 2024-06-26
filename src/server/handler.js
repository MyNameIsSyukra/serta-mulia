const predictClassification = require("../services/inferenceService");
const crypto = require("crypto");
const { getData, storeData } = require("../services/storeData");
const { get } = require("http");

async function postPredictHandler(request, h) {
  try {
    const { image } = request.payload;
    const { model } = request.server.app;

    const { confidenceScore, label, suggestion, isBadRequest } = await predictClassification(model, image);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
      id: id,
      result: label,
      suggestion: suggestion,
      createdAt: createdAt,
    };
    if (!isBadRequest) {
      await storeData(id, data);
      const response = h.response({
        status: "success",
        message: confidenceScore > 99 ? "Model is predicted successfully." : "Model is predicted successfully but under threshold. Please use the correct picture",
        data,
      });
      response.code(201);
      return response;
    } else {
      const response = h.response({
        status: "fail",
        message: "Please use the correct picture.",
      });
      response.code(400);
      return response;
    }
  } catch (error) {
    const response = h.response({
      status: "fail",
      message: "Gambar tidak dapat diproses. Silakan coba lagi.",
    });
    response.code(400);
    return response;
  }
}

async function getHistoriesHandler(request, h) {
  const data = await getData();
  const response = h.response({
    status: "success",
    data,
  });
  response.code(201);
  // console.log(response);
  return response;
}

module.exports = { postPredictHandler, getHistoriesHandler };
