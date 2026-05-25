const mfaService = require("./mfa.service");
const logger = require("../../utils/logger");

// =========================
// 🔐 SETUP MFA
// =========================
exports.setup = async (req, res) => {
  try {
    const userId = req.user.id;

    const result =
      await mfaService.generateSetup(userId);

    return res.status(200).json({
      success: true,
      message: "MFA setup generado",
      data: {
        otpauthUrl: result.otpauthUrl,
        qrCode: result.qrCode,
        secret: result.secret,
      },
    });

  } catch (error) {

    console.error(
      "SETUP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// 🔐 VERIFY SETUP
// =========================
exports.verifySetup = async (req,res)=>{

  try{

    console.log(
      "=== VERIFY SETUP ==="
    );

    console.log(
      "USER:",
      req.user
    );

    console.log(
      "BODY:",
      req.body
    );

    const userId =
      req.user?.id;

    const { token } =
      req.body;

    if(!userId)
      return res.status(400).json({
        success:false,
        message:"userId faltante"
      });

    if(!token)
      return res.status(400).json({
        success:false,
        message:"token requerido"
      });

    const isValid =
      await mfaService
      .verifySetupToken(
        userId,
        token
      );

    console.log(
      "VALID:",
      isValid
    );

    if(!isValid){

      return res.status(401)
      .json({
        success:false,
        message:"Código inválido"
      });

    }

    await mfaService.enableMFA(
      userId
    );

    console.log(
      "✅ MFA ACTIVADO"
    );

    return res.status(200)
    .json({
      success:true,
      message:"MFA OK"
    });

  }

  catch(error){

    console.error(
      "VERIFY ERROR:",
      error
    );

    console.error(
      error.stack
    );

    return res.status(500)
    .json({
      success:false,
      message:error.message
    });

  }

};

// =========================
// 🔐 VERIFY LOGIN MFA
// =========================
exports.verifyLogin = async (req,res)=>{

  try{

    const {
      userId,
      token
    } = req.body;

    if(!userId || !token){

      return res.status(400)
      .json({
        success:false,
        message:
        "userId y token requeridos"
      });

    }

    const isValid =
      await mfaService
      .verifyLoginToken(
        userId,
        token
      );

    if(!isValid){

      return res.status(401)
      .json({
        success:false,
        message:
        "Código MFA inválido"
      });

    }

    const jwt =
      await mfaService
      .generateLoginToken(
        userId
      );

    return res.status(200)
    .json({

      success:true,

      message:
      "MFA validado",

      data:{
        token:jwt
      }

    });

  }

  catch(error){

    console.error(
      "LOGIN MFA ERROR:",
      error
    );

    return res.status(500)
    .json({
      success:false,
      message:error.message
    });

  }

};

// =========================
// ❌ DISABLE MFA
// =========================
exports.disable = async (req,res)=>{

  try{

    const userId =
      req.user.id;

    const { token } =
      req.body;

    const isValid =
      await mfaService
      .verifyLoginToken(
        userId,
        token
      );

    if(!isValid){

      return res.status(401)
      .json({
        success:false,
        message:
        "Código inválido"
      });

    }

    await mfaService
    .disableMFA(
      userId
    );

    return res.status(200)
    .json({
      success:true,
      message:
      "MFA desactivado"
    });

  }

  catch(error){

    console.error(
      "DISABLE ERROR:",
      error
    );

    return res.status(500)
    .json({
      success:false,
      message:error.message
    });

  }

};