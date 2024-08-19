const express = require('express')
const app = express()
const fs = require('fs');
const Razorpay = require("razorpay");
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
require('dotenv').config();
const jwt = require('jsonwebtoken');
app.use(express.static(path.join(__dirname, 'images')));
app.use(cors());
app.use(bodyParser.json())
// mongoose connection
mongoose.connect('mongodb+srv://nandanipatel057:qPrLJ7hONnX9DfYW@cluster0.v2nbfxj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log("mongodb connected"))

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//Contact data
const ContactSchema = new mongoose.Schema({
    name: {
      type: String,
      require: true,
      },
      email: {
      type: String,
      require: true,
      },
      mobile: {
      type: Number,
      require: true,
      },
      message: {
      type: String,
      require: true,
      },
      });

      
 const User = mongoose.model("contactinfo", ContactSchema);
//Contact data Over


   //Register data
   const RegisterSchema = new mongoose.Schema({
    name: {
      type: String,
      require: true,
      },
    email: {
    type: String,
    require: true,
    },
    mobile: {
      type: String,
      require: true,
      },
    password: {
    type: String,
    require: true,
    },
    cart: [
      {
  
        categoryid: {
          type: Number,
          required:true,
        },
        productid:
        {
          type: Number,
          required:true,
         
        },
        productimg:
        {
          type: String,
          
          
         
        },
        productname:
        {
          type: String,
         
         
        },
        productprice:
        {
          type:String,
       
         
        },
        size:
        {
          type: String,
          
        },
        quantity:
        {
          type: Number,
          default: 1
        }
  
  
      },
    ],

    wish: [
      {
  
        categoryid: {
          type: Number,
          required:true,
        },
        productid:
        {
          type: Number,
          required:true,
         
        },
        productimg:
        {
          type: String,
          
          
         
        },
        productname:
        {
          type: String,
         
         
        },
        productprice:
        {
          type:String,
       
         
        },
     
  
  
      },
    ],

    shippingInfo: {
      name: String,
      mobile: String,
      email: String,
      address: String,
      state: String,
      pincode: String,
      landmark: String,
      city: String,
     
    },

    order: [
      
      {

        orderDate:{ 
          type: String

         },
  
        categoryid: {
          type: Number,
          required:true,
        },
        productid:
        {
          type: Number,
          required:true,
         
        },
        productimg:
        {
          type: String,
          
          
         
        },
        productname:
        {
          type: String,
         
         
        },
        productprice:
        {
          type:String,
       
         
        },
        size:
        {
          type: String,
          
        },
        quantity:
        {
          type: Number,
          default: 1
        }
  
  
      },
    ],
    });
    const Register = mongoose.model("registerinfo",RegisterSchema)
   //Register data Over   

 
  //  for newsletter table & schema start
   const NewsSchema = new mongoose.Schema({
 
    email:{
      type: String,
      requre: true,
    },
   
  
  });

  const News = mongoose.model("newlater", NewsSchema);

    //  for newsletter table & schema start



// for payment post

    app.post("/razorpay", async (req, res) => {
      const { amount } = req.body;
     
    
      const options = {
        amount: amount * 100,
        currency: 'INR',
        receipt: "receipt#1",
        payment_capture: '1',
     
        
      };
      
    
      try {
        const response = await razorpay.orders.create(options);
        res.json({
          success:true,
          id: response.id,
          currency: response.currency,
          amount: response.amount,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({success:false,error:'please try again'});
      }
    });

//Api fetch of data.json

app.get('/api/data', (req, res) => {
const filePath = path.join(__dirname, 'data.json');

fs.readFile(filePath, 'utf8', (err, data) => {
if (err) {
console.error(err);
return res.status(500).json({ error: 'Internal Server Error' });
}

const jsonData = JSON.parse(data);

const updatedJson = jsonData.map(item => {
  if (item.img) {
    item.img = 'http://' + req.get('host') + item.img;
  }

  item.products = item.products.map(product => {
    if (product.productimg) {
      product.productimg = 'http://' + req.get('host') + product.productimg;
    }

    if (product.side_image) {
      product.side_image = product.side_image.map(a => {
        if (a.in_image) {
          a.in_image = 'http://' + req.get('host') + a.in_image;
        }
        return a;
      });
    }

    return product;
  });

  return item;
});

res.json({ success: true, data: updatedJson });

});
});


// for newletter post

app.post('/newlater', async(req, res) =>{
  const {email} = req.body;
  

  
  
  try {
  
    const existingUserr = await News.findOne({ email });
    const existingRegister = await Register.findOne({ email });
   
  
    if (existingUserr || existingRegister) {
      return res.json({ success: false, error: 'You are already a Subscriber!!' });
    }
  
  
  
  const result = await News.create({
      email,    
      });
                
      console.log(result);
    
     const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    
  
     const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank You For Subscribing!',
      html: `
        <p>Thank you for Subscrbing with VHX View. We are excited to have you on board!</p>
        <p>Best regards,</p>
        <p>VHX View Team</p>
        <img src="https://i.ibb.co/qnVVcMk/digital-camera-photo-1080x675.jpg">
      `,
    
    
    };
    
    
    
    const info =  await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.json({ success: true, message: 'Thanks for subscribe' });
  } 
  
  
  
  
  catch (error) {
    console.error('Error during Subscribtion:', error);
  
    res.json({ success: false, error: 'Internal Server Error' });
  }
  
  
  });

//save contact data

 app.post('/contact',async(req,res) =>{
 const{name,email,mobile,message}=req.body


 //check if contact detail is match then show error
 try {

 const repeat = await User.findOne({email,message})

 if(repeat){
  return res.json({go:'alert',error:'data alredy exist'})
}
 const result = await User.create({
    name,
    email,
    mobile,
    message,
    
    });

    console.log(result)


     // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome ZEPHYR",
    html: `
      <p>Hello  ${name}</p>
      <p>Thank you for contacting us !!</p> <br>
      <p> WE WILL CONTACT YOU SOON....</p>  <br>
      <p>Best regards,</p>
      <p>ZEPHYR Team</p>

      <img src="https://img.freepik.com/premium-vector/online-clothing-store-app-web-shopping-customer-choosing-dress_81894-7153.jpg?w=740 " alt="">
    `,
  };


  const mailOptions1 = {
    from: process.env.EMAIL_USER,
    to:  process.env.EMAIL_ADMIN,
    subject: "Welcome to ZEPHYR",
    html: `
      <span> Details of Person who contact  us:: </span>  <br>
      <p> Name:${name} <br><br> Email:${email} <br> Mobile:${mobile} <br> Message:${message} </p>
      
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  const info1 = await transporter.sendMail(mailOptions1);
  console.log("Email sent:", info.response);
  console.log("Email sent:", info1.response);


    res.json({go:'success',message:'Thanks For Contacting Us'});
  } catch (error) {
    res.json({ go:'alert', error: 'Contact cannot be submitted' });
  }
   
})
//contact over

    //save register data

app.post('/register', async (req, res) => {
  const { name,email,mobile,password } = req.body;
  console.log(name+email+mobile+password);
  try {
  // Check if user already exists
  const existingUser = await Register.findOne({ email });

  if(existingUser){
    return res.json({go:'alert',registererror:'email alredy exist'})
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const resultregister = await Register.create({
      name,
      email,
      mobile,
      password:hashedPassword,
      
      });
  
      console.log(resultregister)
  
  
       // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    const mailOptions2 = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome ZEPHYR",
      html: `
        <p>Hello  ${name}</p>
        <p>Thank you for Registering !!</p> <br>
      <p>Your Account has been created successfully<p> <br>
        <p>Best regards,</p>
        <p>ZEPHYR Team</p>
  
         <img src="https://img.freepik.com/premium-vector/online-clothing-store-app-web-shopping-customer-choosing-dress_81894-7153.jpg?w=740 " alt="">
      `,
    };
  
    const info2 = await transporter.sendMail(mailOptions2);
   
    console.log("Email sent:", info2.response);

  
  
      res.json({go:'success',registermessage:'Thanks For Registering'});
    } catch (error) {
      res.json({ go:'alert', registererror: 'register details cannot be submitted' });
    }
})
//Register Over


//Schedule Email

schedule.scheduleJob('* * 27 12 2 ', async () => {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
  user: process.env.EMAIL_USER ,
  pass:  process.env.EMAIL_PASS,
    },
  });
  
  const mailOptions = {
    from:process.env.EMAIL_USER,
    to: 'nandanip283@gmail.com',
    subject: 'BIRTHDAY OFFER',
    html:` <p>Hello </p>
    <p>Wishing you a very Happy Birthday!!</p> <br>
    <p> Thanks for connecting with us for so long .
         ZEPHYR provides you a Birthday Special Offer on your very ospicious day .</p>  <br>
    <p>Discount on Every Product till midnight 12.</p>
    <p>Enjoy your day with ZEPHYR</p>

    <img src="https://img.freepik.com/premium-vector/online-clothing-store-app-web-shopping-customer-choosing-dress_81894-7153.jpg?w=740 " alt="">
  `,
  };
  
  
    
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.response);
  console.log('birthday email sent successfully');
    
  }
  
     
  )
//Schedule Email over




// retrive contact data

app.get('/contact-info',async(req,res) =>{
  
  
    const Contactdata = await User.find()
       
        res.json({data:Contactdata})
    
        
    })


// retrive register data
    app.get('/register-info',async(req,res) =>{
  
  
      const Registerdata = await Register.find()
         
          res.json({data:Registerdata})
      
          
      })
   


    


        // login process
        app.post('/login', (req, res) => {
          const { email, password } = req.body;
        
          Register.findOne({ email })
            .then(existingUser => {
              if (!existingUser) {
                return res.json({ go: 'alert', loginerror: 'email is wrong' });
              }
        
              return bcrypt.compare(password, existingUser.password)
                .then(passwordMatch => {
                  if (!passwordMatch) {
                    return res.json({ go: 'alert', loginerror: 'password is wrong' });
                  }
        
                  const token = jwt.sign({ email }, 'secret-key', { expiresIn: '24h' });
        
                  console.log(token);

                  const accountInfo = {
                    name: existingUser.name,
                    email: existingUser.email, 
                    mobile: existingUser.mobile,
             
                  };
        
                  res.json({ go: 'success', loginmessage: 'Thanks For Login', data: token,accountInfo:accountInfo,cartInfo:existingUser.cart,wishInfo:existingUser.wish,shippingInfo:existingUser.shippingInfo,orderInfo:existingUser.order });
                });
            })
            .catch(error => {
              res.json({ go: 'alert', loginerror: 'Login details cannot be submitted' });
            });
        });



        // get account data
app.get('/account-details', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ merror: 'Invalid token' });
      }

      const user = await Register.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const accountInfo = {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      };

      res.json({ accountInfo:accountInfo });
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// ACCOUNT INFORMATION UPDATE 

app.post('/update-account-data', async (req, res) => {
  const { name,email,mobile,password } = req.body;


  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({success: false,  error: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({success: false, error: 'Invalid token' });
      }

      const user = await Register.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({success: false, error: 'User not found' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
        user.name = name;
      user.email = email;
      user.mobile = mobile;
      user.password=hashedPassword
    await user.save();



    const accountInfo = {
    
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      
    };
   

    res.json({ success: true, message: 'Thanks Your Information has Been Updated' ,accountInfo:accountInfo});  
    
    });
  } catch (error) {
    console.error('Error fetching user address:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
   
       });

      //  for add to cart process

      app.post('/add-to-cart', async (req, res) => {
        const { categoryid, productid,productimg,productname,productprice,size } = req.body;

        console.log(productimg)
      
        try {
          const token = req.headers.authorization?.split(' ')[1];
          if (!token) {
            return res.status(401).json({ success: false, error: 'Token not provided' });
          }
      
          jwt.verify(token, 'secret-key', async (err, decoded) => {
            if (err) {
              return res.status(401).json({ success: false, error: 'Invalid token' });
            }
      
            const user = await Register.findOne({ email: decoded.email });
            if (!user) {
              return res.status(404).json({ success: false, error: 'User not found' });
            }
      
            const existingProduct = user.cart.find(
              item => item.categoryid === categoryid && item.productid === productid && item.size === size
            );
            if (existingProduct) {
              return res.json({ success: false, error: 'Product with the same size already in the cart' });
            }
      
            // Add the product to the user's cart
            user.cart.push({
              categoryid,
              productid,
              productimg,
              productname,
              productprice,
              size
            });
      
            const result = await user.save();
      
            console.log(result);
      
            res.json({ success: true, message: 'Thanks Product added to cart', cartInfo: user.cart });
          });
        } catch (error) {
          console.error('Error adding to cart:', error);
          res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
      });



      app.get('/cart', async (req, res) => {
        try {
          const token = req.headers.authorization?.split(' ')[1];
          if (!token) {
            return res.status(401).json({ success: false, message: 'Token not provided' });
          }
      
          jwt.verify(token, 'secret-key', async (err, decoded) => {
            if (err) {
              return res.status(401).json({ success: false, message: 'Invalid token' });
            }
      
            const user = await Register.findOne({ email: decoded.email });
            if (!user) {
              return res.status(404).json({ success: false, message: 'User not found' });
            }
      
            res.json({cartInfo: user.cart });
          });
        } catch (error) {
          console.error('Error fetching cart:', error);
          res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
      });
      
     // for remove product 
app.post('/remove-from-cart', async (req, res) => {
  const { categoryid,productid,size } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }


      const user = await Register.findOneAndUpdate(
        { email: decoded.email },
        { $pull: { cart: { categoryid,productid,size} } },
        { new: true }
      );

   
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

    

      res.json({ success: true, message: 'Thanks Product removed from cart', cartInfo: user.cart });
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}); 



// for increase quantity
app.post('/increase-quantity', async (req, res) => {
  const { categoryid, productid,size } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Find the user by email from the decoded token
      const user = await Register.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const productInCart = user.cart.find(item => item.categoryid === categoryid && item.productid === productid && item.size === size);
      if (productInCart) {
        
        if (productInCart.quantity < 10) {
          productInCart.quantity = productInCart.quantity + 1;
        } else {
          return res.json({success:false, error: 'Maximum quantity 10' });
        }
      } else {
        return res.json({success:false, error: 'Product not found in cart' });
      }

      
      await user.save();


      res.json({ success: true, message: ' Thanks Quantity increased', cartInfo: user.cart });
    });
  } catch (error) {
    console.error('Error increasing quantity:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



// for decrease quantity
app.post('/decrease-quantity', async (req, res) => {
  const { categoryid, productid,size } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Find the user by email from the decoded token
      const user = await Register.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const productInCart = user.cart.find(item => item.categoryid === categoryid && item.productid === productid && item.size===size)
      if (productInCart) {
        
        if (productInCart.quantity > 1) {
          productInCart.quantity = productInCart.quantity - 1;
        } else {
          return res.json({success:false, error: '1 Minimum quantity required' });
        }
      } else {
        return res.json({success:false, error: 'Product not found in cart' });
      }

      
      await user.save();


      res.json({ success: true, message: 'Thanks Quantity increased', cartInfo: user.cart });
    });
  } catch (error) {
    console.error('Error increasing quantity:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// post for add to cart
app.post('/add-to-wish', async (req, res) => {
  const { categoryid, productid,productimg,productname,productprice} = req.body;

  console.log(productimg)

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }

      const user = await Register.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const existingProduct = user.wish.find(
        item => item.categoryid === categoryid && item.productid === productid 
      );
      if (existingProduct) {
        return res.json({ success: false, error: 'Product  already in the wish' });
      }

      // Add the product to the user's cart
      user.wish.push({
        categoryid,
        productid,
        productimg,
        productname,
        productprice,
        
      });

      const result = await user.save();

      console.log(result);

      res.json({ success: true, message: 'Thanks Product added to wish', wishInfo: user.wish });
    });
  } catch (error) {
    console.error('Error adding to wish', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// for cart data get

app.get('/wish', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await Register.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Send the user's cart items
      res.json({ wishInfo: user.wish });
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
 
// for remove product 
app.post('/remove-from-wish', async (req, res) => {
  const { categoryid,productid } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }


      const user = await Register.findOneAndUpdate(
        { email: decoded.email },
        { $pull: { wish: { categoryid,productid} } },
        { new: true }
      );

   
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

    

      res.json({ success: true, message: 'Thanks Product removed from wishlist', wishInfo: user.wish });
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// update shipping info
app.post('/save-shipping-info', async (req, res) => {
  const { name, email, mobile, address, state, pincode, landmark, city } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success:false,error:'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({success:false,error: 'Invalid token' });
      }

      const user = await Register.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({success:false,error: 'User not found' });
      }

      // Prepare the shipping information
      const shippingInfo = {
        name,
        mobile,
        email,
        address,
        state,
        pincode,
        landmark,
        city
      };

      // Update user's shipping information
      user.shippingInfo = shippingInfo;
      await user.save();

      console.log(user);

      res.json({
        success: true,
        message: 'Thanks Shipping information saved successfully',
        shippingInfo: user.shippingInfo
      });
    });
  } catch (error) {
    console.error('Error saving shipping information:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



// get shipping info
app.get('/get-user-address', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await Register.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Send the user's cart items
      res.json({ shippingInfo: user.shippingInfo });
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// add to order
app.post('/add-to-order', async (req, res) => {

  const { orderDate } = req.body;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const user = await Register.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }



      // Add each cart item to the order with the current date
      user.cart.forEach(item => {
        user.order.push({
          orderDate,
          categoryid: item.categoryid,
          productid: item.productid,
          productimg:item.productimg,
          productname:item.productname,
          productprice:item.productprice,
          size: item.size,
          quantity: item.quantity,

        });
      });

      // Clear user cart after adding to order
      user.cart = [];

      await user.save();

      res.json({
        success: true,
        message: 'Thanks! Your Order has Been Confirmed',
        orderInfo: user.order,
        cartInfo: user.cart
      });
    });
  } catch (error) {
    console.error('Error adding to order:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// get order
app.get('/order', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await Register.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

    
      res.json({ orderInfo: user.order });
    });
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.listen(3034, () => {
console.log("server connected")
})