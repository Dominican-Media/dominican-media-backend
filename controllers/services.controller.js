const { uploadFile } = require("../helpers/uploadToCloudinary");
const Services = require("../models/Services");

const handleGetServices = async (req, res) => {
  try {
    const services = await Services.find();

    return res.status(200).json(services);
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ error: "There was an error reterieving services" });
  }
};

const handleGetServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Please provide a service id" });
    }

    const service = await Services.findById({ _id: id });

    if (!service) {
      return res
        .status(400)
        .json({ error: "A service with this identifier is not available" });
    }

    return res.status(200).json({ service });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ error: "There was an error reterieving services" });
  }
};

const handlePostServices = async (req, res) => {
  try {
    const { title, description } = req.body;
    const files = req.files;

    if (!title || !description || !files) {
      return res.status(400).json({ error: "All fields must be complete" });
    }

    const serviceImageUpload = files?.image?.[0]
      ? await uploadFile(files.image[0].buffer, "services")
      : null;

    const [serviceImage] = await Promise.all([serviceImageUpload]);

    const service = new Services({
      title,
      description,
      image: serviceImage?.secure_url,
    });

    await service.save();

    return res
      .status(200)
      .json({ message: "Service added successfully", service });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "There was an error adding a new service" });
  }
};

const handleUpdateServices = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { title, description } = req.body;
    const files = req.files;

    const service = await Services.findOne({ _id: serviceId });

    if (!service) {
      return res
        .status(400)
        .json({ error: "There is no service with this id" });
    }

    if (title) service.title = title;
    if (description) service.description = description;

    const serviceImageUpload = files?.image?.[0]
      ? await uploadFile(files.image[0].buffer, "services")
      : null;

    const [serviceImage] = await Promise.all([serviceImageUpload]);

    if (serviceImage) service.image = serviceImage?.secure_url;

    await service.save();

    return res
      .status(200)
      .json({ message: "Servide updated successfully", service });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "There was an error updating this service" });
  }
};

const handleDeleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "Please select a service to be deleted. A service id is needed",
      });
    }

    await Services.deleteOne({ _id: id });

    return res.status(200).json({ message: "Service deleted successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "There was an error deleting this service" });
  }
};

module.exports = {
  handleGetServices,
  handlePostServices,
  handleUpdateServices,
  handleGetServiceById,
  handleDeleteService,
};
