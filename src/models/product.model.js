import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2';
import {config} from '../config/config.js';


const productsCollection = config.PRODUCTS_COLLECTION

const productSchema = new mongoose.Schema ({
    code : {type:String, unique:true, required:true},
    title: {type:String, required:true },
    description : {type:String, required:true },
    price: {type:Number, required:true },
    stock: {type:Number, required:true },
    category: {type:String, required:true },
    thumbnail: [],
    status: {type:Boolean, required:true},
    owner: String    
})

productSchema.plugin(mongoosePaginate); 

export const productModel = mongoose.model (productsCollection, productSchema)

