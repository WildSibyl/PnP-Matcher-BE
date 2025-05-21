import User from "../models/User.js";

export const getUsers = async (req, res) => {
  const { radius = 5000 } = req.query;
  //    const userId = req.userId;

  //   try {
  //     // 1. Find the current user
  //     const currentUser = await User.findById(userId);

  //     if (!currentUser || !currentUser.address?.location?.coordinates) {
  //       return res.status(400).json({ error: "User location not available" });
  //     }

  //     const [lng, lat] = currentUser.address.location.coordinates;

  //     // 2. Find nearby users based on the current user's location
  //     const nearbyUsers = await User.find({
  //       _id: { $ne: userId }, // exclude current user from results
  //       "address.location": {
  //         $near: {
  //           $geometry: {
  //             type: "Point",
  //             coordinates: [lng, lat], // current user's coordinates, center of the radius
  //           },
  //           $maxDistance: parseInt(radius), // radius in meters
  //         },
  //       },
  //     });

  //     res.status(200).json(nearbyUsers);
  //   } catch (error) {
  //     console.error("Error fetching users:", error);
  //     res.status(500).json({ error: "Server error" });
  //   }

  const allUsers = await User.find({
    "address.location": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [9.993682, 53.551086], //temporary HH coordinates to be exchanged with the one above
        },
        $maxDistance: radius, //in meters
      },
    },
  });

  res.status(200).json(allUsers);
};
