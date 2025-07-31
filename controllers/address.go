package controllers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/GadirB/ecommerce-go/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func AddAddress() gin.HandlerFunc{
	return func (c *gin.Context)  {
		user_id := c.Query("id")
		if user_id == ""{
			c.Header("Content-Type", "application/json")
			c.JSON(http.StatusNotFound, gin.H{"Error": "Invalid Code"})
			c.Abort()
			return 
		} 
		address, err := primitive.ObjectIDFromHex(user_id)
		if err != nil {
			c.IndentedJSON(500, "Internal Server Error")
		} 

		var addresses models.Address

		addresses.Address_ID = primitive.NewObjectID()

		if err = c.BindJSON(&addresses); err != nil {
			c.IndentedJSON(http.StatusNotAcceptable, err.Error())
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)

		match_filter := bson.D{{Key: "$match", Value: bson.D{primitive.E{Key: "_id", Value: address}}}}
		unwind := bson.D{{Key: "$unwind", Value: bson.D{primitive.E{Key: "path", Value: "$address"}}}}
		group := bson.D{{Key: "$group", Value: bson.D{primitive.E{Key: "_id", Value: "$address_id"}, {Key: "count", Value: bson.D{primitive.E{Key: "$sum", Value: 1}}}}}}

		pointCursor, err := userCollection.Aggregate(ctx, mongo.Pipeline{match_filter, unwind, group})

		if err != nil {
			c.IndentedJSON(500, "Internal Server Error")
			return 
		}

		var addressInfo []bson.M
		if err = pointCursor.All(ctx, &addressInfo); err != nil {
			panic(err)
		}

		var size int32
		for _, address_no := range addressInfo {
		count := address_no["count"]
		size = count.(int32)
		}

		if size < 2 {
			filter := bson.D{primitive.E{Key: "_id", Value: address}}
			update := bson.D{{Key: "$push", Value: bson.D{primitive.E{Key: "address", Value: addresses}}}}
			_, err := userCollection.UpdateOne(ctx, filter, update)

			if err != nil {
				fmt.Println(err)
			}
		} else {
			c.IndentedJSON(400, "Not Allowed")
		}

		defer cancel()
		ctx.Done()
	}
}

func EditHomeAddress() gin.HandlerFunc{
    return func (c *gin.Context)  {
		user_id := c.Query("id")
		
		if user_id == ""{
			c.Header("Content-Type", "application/json")
			c.JSON(http.StatusNotFound, gin.H{"Error": "Invalid"})
			c.Abort()
			return 
		}

		usert_id, err := primitive.ObjectIDFromHex(user_id)
		if err != nil {
			c.IndentedJSON(500, "Internal Server Error")
			return 
		}

		var editAddress models.Address

		if err := c.BindJSON(&editAddress); err != nil {
			c.IndentedJSON(http.StatusBadRequest, err.Error())
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		filter := bson.D{primitive.E{Key: "_id", Value: usert_id}}
		update := bson.D{{Key: "$set", Value: bson.D{primitive.E{Key: "address.1.house_name", Value: editAddress.House}, {Key: "address.1.street_name", Value: editAddress.Street}, {Key: "address.1.city_name", Value: editAddress.City}, {Key:"address.1.pin_code", Value: editAddress.Pincode}}}}

		_, err = userCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.IndentedJSON(500, "Wrong Command")
			return 
		}
		defer cancel()
		ctx.Done()
		c.IndentedJSON(200, "successfully updated")
	}
}

func EditWorkAddress() gin.HandlerFunc{
    return func (c *gin.Context)  {
		user_id := c.Query("id")
		
		if user_id == ""{
			c.Header("Content-Type", "application/json")
			c.JSON(http.StatusNotFound, gin.H{"Error": "Invalid"})
			c.Abort()
			return 
		}

		usert_id, err := primitive.ObjectIDFromHex(user_id)
		if err != nil {
			c.IndentedJSON(500, "Internal Server Error")
			return 
		}

		var editAddress models.Address

		if err := c.BindJSON(&editAddress); err != nil {
			c.IndentedJSON(http.StatusBadRequest, err.Error())
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		filter := bson.D{primitive.E{Key: "_id", Value: usert_id}}
		update := bson.D{{Key: "$set", Value: bson.D{primitive.E{Key: "address.0.house_name", Value: editAddress.House}, {Key: "address.0.street_name", Value: editAddress.Street}, {Key: "address.0.city_name", Value: editAddress.City}, {Key:"address.0.pin_code", Value: editAddress.Pincode}}}}

		_, err = userCollection.UpdateOne(ctx, filter, update)

		if err != nil {
			c.IndentedJSON(500, "Wrong Command")
			return 
		}

		defer cancel()
		ctx.Done()
		c.IndentedJSON(200, "successfully updated")
	}
}

func DeleteAddress() gin.HandlerFunc{
	return func (c *gin.Context)  {
		user_id := c.Query("id")
		
		if user_id == ""{
			c.Header("Content-Type", "application/json")
			c.JSON(http.StatusNotFound, gin.H{"Error": "Invalid Search Index"})
			c.Abort()
			return 
		}

		addresses := make([]models.Address, 0)
		usert_id, err := primitive.ObjectIDFromHex(user_id)
		if err != nil {
			c.IndentedJSON(500, "Internal Server Error")
			return 
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		filter := bson.D{primitive.E{Key: "_id", Value: usert_id}}
		update := bson.D{{Key: "$set", Value: bson.D{primitive.E{Key: "address", Value: addresses}}}}

		_, err = userCollection.UpdateOne(ctx, filter, update)

		if err != nil {
			c.IndentedJSON(404, "Wrong Command")
			return 
		}

		defer cancel()
		ctx.Done()
		c.IndentedJSON(200, "Successfully Deleted")
	}
}