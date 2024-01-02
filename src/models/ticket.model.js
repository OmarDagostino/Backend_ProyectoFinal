import mongoose from 'mongoose'
import {config} from '../config/config.js';

const usersCollection = config.USERS_COLLECTION
const cartsCollection = config.CARTS_COLLECTION
const productCollection = config.PRODUCTS_COLLECTION
const ticketsCollection = config.TICKETS_COLLECTION

const ticketsSchema = new mongoose.Schema({
    products: [
      new mongoose.Schema(
        {
          productId: { 
            type:mongoose.Schema.Types.ObjectId, 
            ref:productCollection
          },
          quantity: { type: Number},
          price: {type: Number},
        },
        { _id: false } 
      ),
    ],
    code: {
      type:String,
      unique:true
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:cartsCollection
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:usersCollection
    },
    purchase_datetime: {
      type: Date,
      default: Date.now
    },
    taxes: {
      type: Number
    },
    discounts: {
      type: Number
    },
    amount: {
      type: Number
    }
  });
  

export const ticketsModel = mongoose.model (ticketsCollection,ticketsSchema)

const lastsCollection = config.LAST_TICKET_COLLECTION

const lastSchema = new mongoose.Schema ({
    serie : {type: String, unique:true},
    last: Number
})

export const lastModel = mongoose.model (lastsCollection, lastSchema)
