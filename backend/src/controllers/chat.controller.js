const chatModel=require('../models/chat.model');


async function createChat(req,res){
  const {tittle}=req.body
  const user=req.user;
   const chat = await chatModel.create({
    user:user._id,
    tittle
   })

   res.status(201).json({
    Message:"Chat Created Successfully",
    chat:{
      _id:chat._id,
      tittle:chat.tittle,
      lastActivity:chat.lastActivity,
      user:chat.user



    }
   })
}

module.exports={
  createChat
}