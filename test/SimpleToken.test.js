const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleToken", function () {
  let simpleToken;
  let owner;
  let addr1;
  let addr2;
  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1 millón de tokens

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    simpleToken = await SimpleToken.deploy("MiToken", "MTK", INITIAL_SUPPLY);
    await simpleToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Debe establecer el nombre correcto", async function () {
      expect(await simpleToken.name()).to.equal("MiToken");
    });

    it("Debe establecer el símbolo correcto", async function () {
      expect(await simpleToken.symbol()).to.equal("MTK");
    });

    it("Debe establecer 18 decimales", async function () {
      expect(await simpleToken.decimals()).to.equal(18);
    });

    it("Debe asignar el supply total al dueño", async function () {
      const ownerBalance = await simpleToken.balanceOf(owner.address);
      expect(await simpleToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Debe establecer al dueño correcto", async function () {
      expect(await simpleToken.owner()).to.equal(owner.address);
    });
  });

  describe("Transfers", function () {
    it("Debe transferir tokens entre cuentas", async function () {
      const amount = ethers.parseEther("50");
      
      await simpleToken.transfer(addr1.address, amount);
      expect(await simpleToken.balanceOf(addr1.address)).to.equal(amount);
      
      await simpleToken.connect(addr1).transfer(addr2.address, amount);
      expect(await simpleToken.balanceOf(addr2.address)).to.equal(amount);
    });

    it("Debe fallar si el balance es insuficiente", async function () {
      const initialOwnerBalance = await simpleToken.balanceOf(owner.address);
      
      await expect(
        simpleToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Balance insuficiente");
      
      expect(await simpleToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Debe actualizar balances después de transferencias", async function () {
      const amount = ethers.parseEther("100");
      const initialOwnerBalance = await simpleToken.balanceOf(owner.address);
      
      await simpleToken.transfer(addr1.address, amount);
      await simpleToken.transfer(addr2.address, amount);
      
      expect(await simpleToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance - (amount * 2n)
      );
      expect(await simpleToken.balanceOf(addr1.address)).to.equal(amount);
      expect(await simpleToken.balanceOf(addr2.address)).to.equal(amount);
    });

    it("Debe emitir evento Transfer", async function () {
      const amount = ethers.parseEther("50");
      
      await expect(simpleToken.transfer(addr1.address, amount))
        .to.emit(simpleToken, "Transfer")
        .withArgs(owner.address, addr1.address, amount);
    });
  });

  describe("Allowances", function () {
    it("Debe aprobar tokens para delegado", async function () {
      const amount = ethers.parseEther("100");
      
      await simpleToken.approve(addr1.address, amount);
      expect(await simpleToken.allowance(owner.address, addr1.address)).to.equal(amount);
    });

    it("Debe permitir transferFrom con allowance", async function () {
      const amount = ethers.parseEther("100");
      
      await simpleToken.approve(addr1.address, amount);
      await simpleToken.connect(addr1).transferFrom(owner.address, addr2.address, amount);
      
      expect(await simpleToken.balanceOf(addr2.address)).to.equal(amount);
    });

    it("Debe fallar transferFrom sin allowance suficiente", async function () {
      const amount = ethers.parseEther("100");
      
      await expect(
        simpleToken.connect(addr1).transferFrom(owner.address, addr2.address, amount)
      ).to.be.revertedWith("Allowance insuficiente");
    });

    it("Debe emitir evento Approval", async function () {
      const amount = ethers.parseEther("100");
      
      await expect(simpleToken.approve(addr1.address, amount))
        .to.emit(simpleToken, "Approval")
        .withArgs(owner.address, addr1.address, amount);
    });
  });

  describe("Minting", function () {
    it("Solo el dueño debe poder mintear tokens", async function () {
      const amount = ethers.parseEther("1000");
      
      await simpleToken.mint(addr1.address, amount);
      expect(await simpleToken.balanceOf(addr1.address)).to.equal(amount);
    });

    it("Debe fallar si no es el dueño quien mintea", async function () {
      const amount = ethers.parseEther("1000");
      
      await expect(
        simpleToken.connect(addr1).mint(addr2.address, amount)
      ).to.be.revertedWith("Solo el dueno puede ejecutar esta funcion");
    });

    it("Debe actualizar el totalSupply al mintear", async function () {
      const amount = ethers.parseEther("1000");
      const initialSupply = await simpleToken.totalSupply();
      
      await simpleToken.mint(addr1.address, amount);
      expect(await simpleToken.totalSupply()).to.equal(initialSupply + amount);
    });
  });

  describe("Burning", function () {
    it("Debe permitir quemar tokens propios", async function () {
      const amount = ethers.parseEther("100");
      const initialBalance = await simpleToken.balanceOf(owner.address);
      
      await simpleToken.burn(amount);
      expect(await simpleToken.balanceOf(owner.address)).to.equal(initialBalance - amount);
    });

    it("Debe fallar si se intenta quemar más de lo que se tiene", async function () {
      await expect(
        simpleToken.connect(addr1).burn(ethers.parseEther("100"))
      ).to.be.revertedWith("Balance insuficiente para quemar");
    });

    it("Debe actualizar el totalSupply al quemar", async function () {
      const amount = ethers.parseEther("1000");
      const initialSupply = await simpleToken.totalSupply();
      
      await simpleToken.burn(amount);
      expect(await simpleToken.totalSupply()).to.equal(initialSupply - amount);
    });
  });
});
