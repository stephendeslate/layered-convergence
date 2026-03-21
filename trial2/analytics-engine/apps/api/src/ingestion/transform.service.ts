import { Injectable } from '@nestjs/common';
import {
  TransformStep,
  TransformType,
  DataType,
  FilterOperator,
  DataRecord,
  RenameTransformStep,
  CastTransformStep,
  DeriveTransformStep,
  FilterTransformStep,
} from '@analytics-engine/shared';

@Injectable()
export class TransformService {
  apply(records: DataRecord[], steps: TransformStep[]): DataRecord[] {
    let result = records;

    for (const step of steps) {
      switch (step.type) {
        case TransformType.RENAME:
          result = this.applyRename(result, step);
          break;
        case TransformType.CAST:
          result = this.applyCast(result, step);
          break;
        case TransformType.DERIVE:
          result = this.applyDerive(result, step);
          break;
        case TransformType.FILTER:
          result = this.applyFilter(result, step);
          break;
        default: {
          const exhaustiveCheck: never = step;
          throw new Error(`Unknown transform type: ${(exhaustiveCheck as TransformStep).type}`);
        }
      }
    }

    return result;
  }

  private applyRename(records: DataRecord[], step: RenameTransformStep): DataRecord[] {
    return records.map((record) => {
      const result = { ...record };
      if (step.source in result) {
        result[step.target] = result[step.source];
        delete result[step.source];
      }
      return result;
    });
  }

  private applyCast(records: DataRecord[], step: CastTransformStep): DataRecord[] {
    return records.map((record) => {
      const result = { ...record };
      const value = result[step.field];

      if (value === null || value === undefined) return result;

      switch (step.toType) {
        case DataType.STRING:
          result[step.field] = String(value);
          break;
        case DataType.NUMBER: {
          const num = Number(value);
          result[step.field] = isNaN(num) ? null : num;
          break;
        }
        case DataType.DATE: {
          const date = new Date(value as string | number);
          result[step.field] = isNaN(date.getTime()) ? null : date.toISOString();
          break;
        }
        case DataType.BOOLEAN:
          if (typeof value === 'string') {
            result[step.field] = ['true', '1', 'yes'].includes(value.toLowerCase());
          } else {
            result[step.field] = Boolean(value);
          }
          break;
      }

      return result;
    });
  }

  private applyDerive(records: DataRecord[], step: DeriveTransformStep): DataRecord[] {
    return records.map((record) => {
      const result = { ...record };
      try {
        result[step.field] = this.evaluateExpression(step.expression, record);
      } catch {
        result[step.field] = null;
      }
      return result;
    });
  }

  private applyFilter(records: DataRecord[], step: FilterTransformStep): DataRecord[] {
    return records.filter((record) => {
      const value = record[step.field];
      return this.evaluateCondition(value, step.operator, step.value);
    });
  }

  private evaluateExpression(expression: string, record: DataRecord): unknown {
    const fieldPattern = /\{(\w+)\}/g;
    let numericExpression = expression;

    numericExpression = numericExpression.replace(fieldPattern, (_match, fieldName: string) => {
      const val = record[fieldName];
      if (val === null || val === undefined) return '0';
      return String(Number(val) || 0);
    });

    if (!/^[\d\s+\-*/().]+$/.test(numericExpression)) {
      throw new Error(`Unsafe expression: ${expression}`);
    }

    const fn = new Function(`return (${numericExpression})`);
    return fn();
  }

  private evaluateCondition(
    value: unknown,
    operator: FilterOperator,
    target: string | number | boolean,
  ): boolean {
    if (value === null || value === undefined) return false;

    switch (operator) {
      case FilterOperator.EQ:
        return value === target;
      case FilterOperator.NOT_EQ:
        return value !== target;
      case FilterOperator.GT:
        return Number(value) > Number(target);
      case FilterOperator.GTE:
        return Number(value) >= Number(target);
      case FilterOperator.LT:
        return Number(value) < Number(target);
      case FilterOperator.LTE:
        return Number(value) <= Number(target);
      case FilterOperator.CONTAINS:
        return String(value).includes(String(target));
      case FilterOperator.NOT_CONTAINS:
        return !String(value).includes(String(target));
      default: {
        const exhaustiveCheck: never = operator;
        throw new Error(`Unknown filter operator: ${exhaustiveCheck}`);
      }
    }
  }
}
