import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { InvoiceService } from "./invoice.service";

@Controller("invoices")
@UseGuards(AuthGuard("jwt"))
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() body: { number: string; amount: number; tax: number; customerId: string; companyId: string; dueDate: string }) {
    return this.invoiceService.createInvoice({ ...body, dueDate: new Date(body.dueDate) });
  }

  @Post(":id/transition")
  transition(@Param("id") id: string, @Body() body: { status: string }) {
    return this.invoiceService.transitionInvoice(id, body.status);
  }

  @Get("company/:companyId")
  getByCompany(@Param("companyId") companyId: string) {
    return this.invoiceService.getInvoicesByCompany(companyId);
  }
}
