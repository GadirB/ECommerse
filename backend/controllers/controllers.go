package controllers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/GadirB/ecommerce-go/database"
	"github.com/GadirB/ecommerce-go/models"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
	generate "github.com/GadirB/ecommerce-go/tokens"
)

var userCollection *mongo.Collection = database.UserData(database.Client, "Users")
var productCollection *mongo.Collection = database.ProductData(database.Client, "Products")
var Validate = validator.New()

func HashPassword (password string) string{
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err!= nil {
		log.Panic(err)
	}
	return string(bytes)
}

func VerifyPassword (userPassword string, givenPassword string) (bool, string){
	err := bcrypt.CompareHashAndPassword([]byte(givenPassword), []byte(userPassword))
	valid := true
	msg := ""

	if err!= nil {
		valid = false
		msg = "password is not valid"
	}
	return valid, msg
}

func SignUp () gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		
		var user models.User
		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		validationErr := Validate.Struct(user)
		if validationErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErr})
			return
		} 

		count, err := userCollection.CountDocuments(ctx, bson.M{"email": user.Email})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err})
			return
		}

		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user already exists"})
			return 
		}

		count, err = userCollection.CountDocuments(ctx, bson.M{"phone": user.Phone})

		defer cancel()
		if err != nil {
			log.Panic(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err})
			return
		}

		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "this phone is already in use"})
			return 
		}

		password := HashPassword(*user.Password)
		user.Password = &password

		user.Created_At, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		user.Updated_At, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		user.ID = primitive.NewObjectID()
		user.User_ID = user.ID.Hex()

		token, refreshToken, _ := generate.TokenGenerator(*user.Email, *user.First_Name, *user.Last_Name, user.User_ID)
		user.Token = &token
		user.Refresh_Token = &refreshToken
		user.UserCart = make([]models.ProductUser, 0)
		user.Address_Details = make([]models.Address, 0)
		user.Order_Status = make([]models.Order, 0)

		_, inserter := userCollection.InsertOne(ctx, user)
		if inserter != nil {
			log.Printf("Insert error: %v", inserter)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "user not created"})
			return
		}
		
		defer cancel()

		c.JSON(http.StatusCreated, gin.H{"message": "user created successfully"})
	}
}

func Login() gin.HandlerFunc{
	return func (c *gin.Context)  {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var user models.User
		var foundUser models.User

		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err})
			return
		}

		err := userCollection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&foundUser)
		defer cancel()

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "login failed"})
			return
		}

		PasswordIsValid, msg := VerifyPassword(*user.Password, *foundUser.Password)

		defer cancel()

		if !PasswordIsValid {
			c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
			fmt.Println(msg)
			return
		}
		
		token, refreshToken, _ := generate.TokenGenerator(*foundUser.Email, *foundUser.First_Name, *foundUser.Last_Name, foundUser.User_ID)
		
		defer cancel()

		generate.UpdateAllTokens(token, refreshToken, foundUser.User_ID)

		c.JSON(http.StatusOK, gin.H{
			"token": token,
			"refresh_token": refreshToken,
			"InsertedID": foundUser.User_ID,
			"user": foundUser,
		})
	}
}

func ProductViewerAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var products models.Product
		defer cancel()
		if err := c.BindJSON(&products); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		products.Product_ID = primitive.NewObjectID()
		_, anyerr := productCollection.InsertOne(ctx, products)
		if anyerr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Not Created"})
			return
		}
		defer cancel()
		c.JSON(http.StatusOK, "Successfully added our Product Admin!!")
	}
}


func SearchProduct() gin.HandlerFunc{
	return func(c *gin.Context){
		var productList []models.Product
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		cursor, err := productCollection.Find(ctx, bson.D{{}})
		if err!= nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "can't find product"})
			return
		}

		err = cursor.All(ctx, &productList)

		if err != nil {
			log.Println(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return 
		}

		defer cursor.Close(ctx)

		if err := cursor.Err(); err != nil {
			log.Println(err)
			c.IndentedJSON(400, "invalid")
			return
		}

		defer cancel()
		c.IndentedJSON(200, productList)
	}
}

func SearchProductByQuery() gin.HandlerFunc{
	return func (c *gin.Context)  {
		var searchProducts []models.Product
		queryParam := c.Query("name")

		if queryParam == "" {
			log.Println("query is empty")
			c.Header("Content-Type", "application/json")
			c.IndentedJSON(http.StatusNotFound, gin.H{"Error": "Invalid search index"})
			c.Abort()
			return 
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		searchQueryDB, err := productCollection.Find(ctx, bson.M{"product_name": bson.M{"$regex":queryParam}})
		
		if err!= nil {
			c.IndentedJSON(404, "can't find product")
			return
		}

		err = searchQueryDB.All(ctx, &searchProducts)
		if err!= nil {
			log.Println(err)
			c.IndentedJSON(400, "invalid")
			return
		}

		defer searchQueryDB.Close(ctx)


		if err := searchQueryDB.Err(); err != nil {
			log.Println(err)
			c.IndentedJSON(400, "invalid request")
			return 
		}

		defer cancel()
		c.IndentedJSON(200, searchProducts)
	}
}