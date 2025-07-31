package database

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/GadirB/ecommerce-go/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	ErrCantFindProduct = errors.New("can't find product")
	ErrCantDecodeProducts = errors.New("can't find product")
	ErrUserIdIsNotValid = errors.New("user_id is not valid")
	ErrCantUpdateUser = errors.New("can't update user")
	ErrCantRemoveItemCart = errors.New("can't remove item from cart")
	ErrCantGetItem = errors.New("can't get item from cart")
	ErrCantBuyCartItem = errors.New("can't buy cart item")
)

func AddProductToCart(ctx context.Context, productCollection *mongo.Collection, userCollection *mongo.Collection, productID primitive.ObjectID, userID string) error {
	searchFromDB, err := productCollection.Find(ctx, bson.M{"_id": productID})
	if err != nil {
		log.Println(err)
		return ErrCantFindProduct
	} 
	var productCart []models.ProductUser 
	err = searchFromDB.All(ctx, &productCart)
	if err != nil {
		log.Println(err)
		return ErrCantDecodeProducts
	}
	id, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Println(err)
		return ErrUserIdIsNotValid
	}

	filter := bson.D{primitive.E{Key: "_id", Value: id}}
	update := bson.D{{Key: "$push", Value: bson.D{primitive.E{Key: "usercart", Value: bson.D{{Key: "$each", Value: productCart}}}}}}

	_, err = userCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		return ErrCantUpdateUser
	}

	return nil
}

func RemoveCartItem(ctx context.Context, productCollection *mongo.Collection, userCollection *mongo.Collection, productID primitive.ObjectID, userID string) error {
	id , err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Println(err)
		return ErrUserIdIsNotValid
	}

	filter := bson.D{primitive.E{Key: "_id", Value: id}}
	update := bson.M{"$pull":bson.M{"usercart": bson.M{"_id":productID}}}
	_, err = userCollection.UpdateMany(ctx, filter, update)
	if err != nil {
		return ErrCantRemoveItemCart
	}

	return nil
}

func BuyItemFromCart(ctx context.Context, userCollection *mongo.Collection, userID string) error{
	id, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Println(err)
		return ErrUserIdIsNotValid
	}

	var getCartItems models.User
	var orderCart models.Order

	orderCart.Order_ID = primitive.NewObjectID()
	orderCart.Ordered_At = time.Now()
	orderCart.Order_Cart = make([]models.ProductUser, 0)
	orderCart.Payment_Method.COD = true

	unwind := bson.D{{Key: "$unwind", Value: bson.D{primitive.E{Key: "path", Value: "$usercart"}}}}
	grouping := bson.D{{Key: "$group", Value: bson.D{primitive.E{Key: "_id", Value: "$_id"}, {Key: "total", Value: bson.D{primitive.E{Key: "$sum", Value: "$usercart.price"}}}}}}
	
	currentResults, err := userCollection.Aggregate(ctx, mongo.Pipeline{unwind, grouping})

	ctx.Done()
	if err != nil {
		panic(err)
	}

	var getUserCart []bson.M
	if err = currentResults.All(ctx, &getUserCart); err != nil {
		panic(err)
	}

	var totalPrice int32

	for _, user_item := range getUserCart{
		price := user_item["total"]
		totalPrice = price.(int32)
	}

	orderCart.Price = int(totalPrice)

	filter := bson.D{primitive.E{Key: "_id", Value: id}}
	update := bson.D{{Key: "$push", Value: bson.D{primitive.E{Key: "orders", Value: orderCart}}}}

	_, err = userCollection.UpdateMany(ctx, filter, update)
	if err != nil {
		log.Println(err)
	}

	err = userCollection.FindOne(ctx, bson.D{primitive.E{Key: "_id", Value: id}}).Decode(&getCartItems)
	if err != nil {
		log.Println(err)
	}

	filter2 := bson.D{primitive.E{Key: "_id", Value: id}}
	update2 := bson.M{"$push":bson.M{"orders.$[].order_list": bson.M{"$each":getCartItems.UserCart}}}

	_, err = userCollection.UpdateOne(ctx, filter2, update2)
	if err != nil {
		log.Println(err)
	}

	userCartEmpty := make([]models.ProductUser, 0)

	filtered := bson.D{primitive.E{Key: "_id", Value: id}}
	updated := bson.D{{Key: "$set", Value: bson.D{primitive.E{Key: "usercart", Value: userCartEmpty}}}}

	_, err = userCollection.UpdateOne(ctx, filtered, updated)
	if err != nil {
		return ErrCantBuyCartItem
	}

	return nil
}

func InstantBuyer(ctx context.Context, productCollection *mongo.Collection, userCollection *mongo.Collection, productID primitive.ObjectID, userID string) error{
	id, err := primitive.ObjectIDFromHex(userID)

	if err != nil {
		log.Println(err)
		return ErrUserIdIsNotValid
	}

	var productDetails models.ProductUser
	var orderDetails models.Order

	orderDetails.Order_ID = primitive.NewObjectID()
	orderDetails.Ordered_At = time.Now()
	orderDetails.Order_Cart = make([]models.ProductUser, 0)
	orderDetails.Payment_Method.COD = true
	err = productCollection.FindOne(ctx, bson.D{primitive.E{Key: "_id", Value: productID}}).Decode(&productDetails)

	if err != nil {
		log.Println(err)
	}

	orderDetails.Price = productDetails.Price

	filter := bson.D{primitive.E{Key: "_id", Value: id}}
	update := bson.D{{Key: "$push", Value: bson.D{primitive.E{Key: "orders", Value: orderDetails}}}}

	_, err = userCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Println(err)
	}


	filter2 := bson.D{primitive.E{Key: "_id", Value: id}}
	update2 := bson.M{"$push": bson.M{"orders.$[].order_list":productDetails}}

	_, err = userCollection.UpdateOne(ctx, filter2, update2)
	if err != nil {
		log.Println(err)
	}

	return nil
} 