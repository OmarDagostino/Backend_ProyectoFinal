import mongoose from 'mongoose'
import {config} from '../../src/config/config.js';

const cartsCollection = config.CARTS_COLLECTION
const productCollection = config.PRODUCTS_COLLECTION

const cartSchema = new mongoose.Schema({
    products: [
      new mongoose.Schema(
        {
          productId: { 
            type:mongoose.Schema.Types.ObjectId, 
            ref:productCollection
          },
          quantity: { type: Number},
        },
        { _id: false } 
      ),
    ],
  });
  

export const cartModel = mongoose.model (cartsCollection,cartSchema)
