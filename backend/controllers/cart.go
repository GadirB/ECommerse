package controllers

import (
	"context"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/GadirB/ecommerce-go/database"
	"github.com/GadirB/ecommerce-go/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Application struct {
	productCollection *mongo.Collection
	userCollection *mongo.Collection
}

func NewApplication(productCollection *mongo.Collection, userCollection *mongo.Collection) *Application {
	return &Application{
		productCollection: productCollection,
		userCollection: userCollection,
	}
}

func (app *Application) AddToCart() gin.HandlerFunc{
	return func (c *gin.Context)  {
		productQueryID := c.Query("id")
		if productQueryID == "" {
			log.Println("product id is empty")

			_ = c.AbortWithError(http.StatusBadRequest, errors.New("product id is empty"))
			return 
		}
		
		userQueryID := c.Query("userID")
		if userQueryID == "" {
			log.Println("user id is empty")
			_ = c.AbortWithError(http.StatusBadRequest, errors.New("user id is empty"))
			return 
		}
		
		productID, err := primitive.ObjectIDFromHex(productQueryID)

		if err!= nil {
			log.Println(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return 
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)

		defer cancel()

		err = database.AddProductToCart(ctx, app.productCollection, app.userCollection, productID, userQueryID)
		if err!= nil {
			c.IndentedJSON(http.StatusInternalServerError, err)
			return
		}
		c.IndentedJSON(200, "product added to cart")
	}
}

func (app *Application) RemoveItem() gin.HandlerFunc{
	return func (c *gin.Context)  {
		productQueryID := c.Query("id")
		if productQueryID == "" {
			log.Println("product id is empty")

			_ = c.AbortWithError(http.StatusBadRequest, errors.New("product id is empty"))
			return 
		}
		
		userQueryID := c.Query("userID")
		if userQueryID == "" {
			log.Println("user id is empty")
			_ = c.AbortWithError(http.StatusBadRequest, errors.New("user id is empty"))
			return 
		}
		
		productID, err := primitive.ObjectIDFromHex(productQueryID)

		if err!= nil {
			log.Println(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return 
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)

		defer cancel()

		err = database.RemoveCartItem(ctx, app.productCollection, app.userCollection, productID, userQueryID)

		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, err)
			return
		}
		c.IndentedJSON(200, "item removed from cart")
	}
}

func GetItemFromCart() gin.HandlerFunc{
	return func (c *gin.Context)  {
		user_id := c.Query("id")

		if user_id == "" {
			c.Header("Content-Type", "application/json")
			c.JSON(http.StatusNotFound, gin.H{"Error": "Invalid ID"})
			c.Abort()
			return 
		}
		
		usert_id, _ := primitive.ObjectIDFromHex(user_id)
		
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		userCollection := database.UserData(database.Client, "Users")

		var filledCart models.User
		err := userCollection.FindOne(ctx, bson.D{primitive.E{Key: "_id", Value: usert_id}}).Decode(&filledCart)

		if err != nil {
			log.Println(err)
			c.IndentedJSON(500, "Not Found")
			return
		}

		filter_match := bson.D{{Key: "$match", Value: bson.D{primitive.E{Key: "_id", Value: usert_id}}}}
		unwind := bson.D{{Key: "$unwind", Value: bson.D{primitive.E{Key: "path", Value: "$usercart"}}}}
		grouping := bson.D{{Key: "$group", Value: bson.D{primitive.E{Key: "_id", Value: "$_id"}, {Key: "total", Value: bson.D{primitive.E{Key: "$sum", Value: "$usercart.price"}}}}}}

		pointCursor, err := userCollection.Aggregate(ctx, mongo.Pipeline{filter_match, unwind, grouping})

		if err != nil {
			log.Println(err)
		}

		var listing []bson.M
		if err = pointCursor.All(ctx, &listing); err != nil {
			log.Println(err)
			c.AbortWithStatus(http.StatusInternalServerError)
		}

		var total int = 0
		if len(listing) > 0 {
			log.Println("Aggregate result:", listing[0])
			
			if totalValue, ok := listing[0]["total"].(int32); ok {
				total = int(totalValue)
				log.Println("Total successfully converted from int32:", total)
			} else {
				log.Printf("Total is not int32, actual type: %T, value: %v", listing[0]["total"], listing[0]["total"])
				
				for _, item := range filledCart.UserCart {
					total += item.Price
				}
				log.Println("Used fallback calculation, total:", total)
			}
		}

		c.JSON(200, gin.H{
			"cart_items": filledCart.UserCart,
			"total_price": total,
			"total_items": len(filledCart.UserCart),
		})

		ctx.Done()
	}
}

func (app *Application) BuyFromCart() gin.HandlerFunc{
	return func (c *gin.Context)  {
		userQueryID := c.Query("id")

		if userQueryID == "" {
			log.Panicln("user id is empty")
			_ = c.AbortWithError(http.StatusBadRequest, errors.New("UserID is empty"))
			return 
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)

		defer cancel()

		err := database.BuyItemFromCart(ctx, app.userCollection, userQueryID)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, err)
			return
		}

		c.IndentedJSON(200, "items placed the order")
	}
}

func (app *Application) InstantBuy() gin.HandlerFunc{
	return func (c *gin.Context)  {
		productQueryID := c.Query("id")
		if productQueryID == "" {
			log.Println("product id is empty")

			_ = c.AbortWithError(http.StatusBadRequest, errors.New("product id is empty"))
			return 
		}
		
		userQueryID := c.Query("userID")
		if userQueryID == "" {
			log.Println("user id is empty")
			_ = c.AbortWithError(http.StatusBadRequest, errors.New("user id is empty"))
			return 
		}
		
		productID, err := primitive.ObjectIDFromHex(productQueryID)

		if err!= nil {
			log.Println(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return 
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)

		defer cancel()

		err = database.InstantBuyer(ctx, app.productCollection, app.userCollection, productID, userQueryID)

		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, err)
			return
		}

		c.IndentedJSON(200, "product placed ther order")
	}
}