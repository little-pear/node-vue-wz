module.exports = (app) => {
  const express = require("express");
  const router = express.Router({
    mergeParams: true,
  });

  // 创建资源
  router.post("/", async (req, res) => {
    const model = await req.Model.create(req.body);
    res.send(model);
  });

  // 更新资源
  router.put("/:id", async (req, res) => {
    const model = await req.Model.findByIdAndUpdate(req.params.id, req.body);
    res.send(model);
  });

  // 删除资源
  router.delete("/:id", async (req, res) => {
    await req.Model.findByIdAndDelete(req.params.id, req.body);
    res.send({
      success: true,
    });
  });

  // 资源列表接口
  router.get("/",async (req, res, next) => {
    await next();
  }, async (req, res) => {
    const queryOptions = {};
    if (req.Model.modelName === "Category") {
      queryOptions.populate = "parent";
    }
    const items = await req.Model.find().setOptions(queryOptions).limit(10);
    res.send(items);
  });

  // 资源详情
  router.get("/:id", async (req, res) => {
    const model = await req.Model.findById(req.params.id);
    res.send(model);
  });
  app.use(
    "/admin/api/rest/:resource",
    async (req, res, next) => {
      const modelName = require("inflection").classify(req.params.resource);
      req.Model = require(`../../models/${modelName}`);
      next();
    },
    router
  );

  const multer = require("multer");
  const upload = multer({ dest: __dirname + "/../../uploads" });
  app.post("/admin/api/upload", upload.single("file"), async (req, res) => {
    const file = req.file;
    file.url = `http://localhost:3000/uploads/${file.filename}`;
    res.send(file);
  });

  app.post("/admin/api/login", async (req, res) => {
    // res.send("ok");
    const { username, password } = req.body;
    // 根据用户名找用户
    const AdminUser = require("../../models/AdminUser");
    const user = await AdminUser.findOne({ username }).select("+password");
    if (!user) {
      return res.status(422).send({
        message: "用户不存在",
      });
    }
    // 校验密码
    const inValid = require("bcrypt").compareSync(password, user.password);
    if (!inValid) {
      return res.status(422).send({
        message: "密码错误",
      });
    }
    // 返回token
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: user._id }, app.get("secret"));
    res.send({ token });
  });
};
