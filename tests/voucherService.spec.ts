import voucherRepository from "../src/repositories/voucherRepository";
import voucherService from "../src/services/voucherService";

describe("voucherService.createVoucher()", () => {
   it("should create a new voucher", async () => {
      voucherRepository.getVoucherByCode = jest.fn().mockResolvedValue(null);

      voucherRepository.createVoucher = jest.fn();

      await voucherService.createVoucher("MYVOUCHER", 10);

      expect(voucherRepository.getVoucherByCode).toHaveBeenCalledWith(
         "MYVOUCHER"
      );

      expect(voucherRepository.createVoucher).toHaveBeenCalledWith(
         "MYVOUCHER",
         10
      );
   });

   it("should throw an error if voucher already exists", async () => {
      voucherRepository.getVoucherByCode = jest.fn().mockResolvedValue({});

      await expect(
         voucherService.createVoucher("MYVOUCHER", 10)
      ).rejects.toHaveProperty("type", "conflict");
   });
});

describe("voucherService.applyVoucher()", () => {
   it("should throw an error if voucher doesnt exists", async () => {
      jest
         .spyOn(voucherRepository, "getVoucherByCode")
         .mockImplementationOnce(() => null);
      await expect(
         voucherService.applyVoucher("MYCODE", 10)
      ).rejects.toHaveProperty("type", "conflict");
   });
   it("should return applied equal to false if amount be invalid for discount", async () => {
      const amountInvalidForDiscount = 99;
      jest
         .spyOn(voucherRepository, "getVoucherByCode")
         .mockImplementationOnce((): any => {
            return { used: false, discount: 20 };
         });
      await expect(
         voucherService.applyVoucher("MYCODE", amountInvalidForDiscount)
      ).resolves.toHaveProperty("applied", false);
   });
   it("should return applied equal to false if voucher has already been used", async () => {
      const amountValidForDiscount = 101;
      jest
         .spyOn(voucherRepository, "getVoucherByCode")
         .mockImplementationOnce((): any => {
            return { used: true, discount: 20 };
         });
      await expect(
         voucherService.applyVoucher("MYCODE", amountValidForDiscount)
      ).resolves.toHaveProperty("applied", false);
   });
   it("should return the applied and discount properties correctly if voucher be applied", async () => {
      const amountValidForDiscount = 101;
      voucherRepository.getVoucherByCode = jest.fn((): any => {
         return { used: false, discount: 20 };
      });
      jest
         .spyOn(voucherRepository, "useVoucher")
         .mockImplementationOnce((): any => {});

      await expect(
         voucherService.applyVoucher("MYCODE", amountValidForDiscount)
      ).resolves.toStrictEqual({
         amount: amountValidForDiscount,
         discount: 20,
         finalAmount:
            amountValidForDiscount - amountValidForDiscount * (20 / 100),
         applied: true,
      });
   });
});
