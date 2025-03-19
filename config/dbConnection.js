const mongoose = require("mongoose");

const connectDB = async() => {
	try
	{
		const db = 'mongodb+srv://sp1172389:bip8TiPrPwj6ry8Q@cluster0.8aowm.mongodb.net/';
		await mongoose.connect(db);
		console.log("MongoDB connected...");
	}
	catch(err)
	{
		console.log(err);
		process.exit(1);
	}
}

module.exports = connectDB;