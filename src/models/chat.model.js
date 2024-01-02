import mongoose from 'mongoose'
import {config} from '../config/config.js';


const chatsCollection = config.MESSAGES_COLLECTION

const chatSchema = new mongoose.Schema ({
    user : String,
   message : String
})

export const chatModel = mongoose.model (chatsCollection,chatSchema)
