const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HelloWorld", function () {
  let helloWorld;
  let owner;
  let addr1;

  beforeEach(async function () {
    // Obtener cuentas de prueba
    [owner, addr1] = await ethers.getSigners();

    // Desplegar el contrato
    const HelloWorld = await ethers.getContractFactory("HelloWorld");
    helloWorld = await HelloWorld.deploy("Hola Mundo desde la Blockchain!");
    await helloWorld.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Debe establecer el mensaje inicial correctamente", async function () {
      expect(await helloWorld.message()).to.equal("Hola Mundo desde la Blockchain!");
    });

    it("Debe inicializar el contador de cambios en 0", async function () {
      expect(await helloWorld.messageChangeCount()).to.equal(0);
    });
  });

  describe("setMessage", function () {
    it("Debe cambiar el mensaje", async function () {
      await helloWorld.setMessage("Nuevo mensaje");
      expect(await helloWorld.message()).to.equal("Nuevo mensaje");
    });

    it("Debe incrementar el contador de cambios", async function () {
      await helloWorld.setMessage("Mensaje 1");
      expect(await helloWorld.messageChangeCount()).to.equal(1);
      
      await helloWorld.setMessage("Mensaje 2");
      expect(await helloWorld.messageChangeCount()).to.equal(2);
    });

    it("Debe emitir el evento MessageChanged", async function () {
      await expect(helloWorld.setMessage("Nuevo mensaje"))
        .to.emit(helloWorld, "MessageChanged")
        .withArgs("Hola Mundo desde la Blockchain!", "Nuevo mensaje", owner.address);
    });
  });

  describe("getMessage", function () {
    it("Debe retornar el mensaje actual", async function () {
      const message = await helloWorld.getMessage();
      expect(message).to.equal("Hola Mundo desde la Blockchain!");
    });
  });

  describe("whoAmI", function () {
    it("Debe retornar la dirección del llamador", async function () {
      expect(await helloWorld.whoAmI()).to.equal(owner.address);
      expect(await helloWorld.connect(addr1).whoAmI()).to.equal(addr1.address);
    });
  });

  describe("addGreeting", function () {
    it("Debe agregar el saludo correctamente", async function () {
      expect(await helloWorld.addGreeting("Ethereum")).to.equal("Hello, Ethereum!");
      expect(await helloWorld.addGreeting("Solidity")).to.equal("Hello, Solidity!");
    });
  });
});
