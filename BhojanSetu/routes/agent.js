const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Donation = require("../models/donation.js");
const upload = require("../middleware/upload");


router.get("/agent/dashboard", middleware.ensureAgentLoggedIn, async (req,res) => {
	const agentId = req.user._id;
	const numAssignedDonations = await Donation.countDocuments({ agent: agentId, status: "assigned" });
	const numCollectedDonations = await Donation.countDocuments({ agent: agentId, status: "collected" });
	const currentUser = await User.findById(agentId);

	res.render("agent/dashboard", {
		title: "Dashboard",
		numAssignedDonations, 
		numCollectedDonations,
		currentUser,
	});
});

router.get("/agent/collections/pending", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const pendingCollections = await Donation.find({ agent: req.user._id, status: "assigned" }).populate("donor");
		res.render("agent/pendingCollections", { title: "Pending Collections", pendingCollections });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/agent/collections/previous", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const previousCollections = await Donation.find({ agent: req.user._id, status: "collected" }).populate("donor");
		res.render("agent/previousCollections", { title: "Previous Collections", previousCollections });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/agent/collection/view/:collectionId", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const collectionId = req.params.collectionId;
		const collection = await Donation.findById(collectionId).populate("donor");
		res.render("agent/collection", { title: "Collection details", collection });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/agent/collection/collect/:collectionId", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const collectionId = req.params.collectionId;
		await Donation.findByIdAndUpdate(collectionId, { status: "collected", collectionTime: Date.now() });
		req.flash("success", "Donation collected successfully");
		res.redirect(`/agent/collection/view/${collectionId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});




// Get Profile
router.get("/agent/profile", middleware.ensureAgentLoggedIn, async (req, res) => {
	const currentUser = await User.findById(req.user._id);
	res.render("agent/profile", { title: "My Profile", currentUser });
  });
  
  // Update Profile
  router.put("/agent/profile", middleware.ensureAgentLoggedIn, upload.single("image"), async (req, res) => { 
	try {
	  const id = req.user._id;
	  const updateObj = req.body.agent;
  
	  if (req.file) {
		updateObj.image = '/uploads/' + req.file.filename;
	  }
  
	  await User.findByIdAndUpdate(id, updateObj);
	  req.flash("success", "Profile updated successfully");
	  res.redirect("/agent/profile");
	} catch (err) {
	  console.error(err);
	  req.flash("error", "Some error occurred on the server.");
	  res.redirect("back");
	}
  });
  


module.exports = router;